import { beforeAll, describe, expect, it } from "vitest";

import {
  addMember,
  as,
  createBusiness,
  createTestDatabase,
  createUser,
  type TestDatabase,
} from "./harness";

let db: TestDatabase;
let owner: string;
let manager: string;
let staff: string;
let outsider: string;
let businessId: string;
let otherBusinessId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });
const server = { role: "service_role" as const };

async function call<T = Record<string, unknown>>(
  identity: { role: "authenticated" | "service_role" | "anon"; userId?: string },
  sql: string,
  params: unknown[] = [],
) {
  return as(
    db,
    identity,
    async (tx) => (await tx.query<{ result: T }>(sql, params)).rows[0]?.result as T,
    { commit: true },
  );
}

const sellAtDesk = (amount = 5000, by = owner, business = businessId) =>
  call<{ gift_card_id: string; number: number; code: string }>(
    user(by),
    "select public.create_desk_gift_card($1, $2, 'card', 'Buyer') as result",
    [business, amount],
  );

/** A fresh, unpaid shop order, so the "still due" cap doesn't interfere unless a test wants it. */
const newOrder = async (totalCents = 100000) =>
  (
    await db.query<{ id: string }>(
      "insert into public.orders (business_id, customer_name, total_cents, currency) values ($1, 'Client', $2, 'EUR') returning id",
      [businessId, totalCents],
    )
  ).rows[0]!.id;

type Redemption = {
  balance_cents: number;
  payment_id: string | null;
  transaction_id: number;
  duplicate?: boolean;
};
const redeem = async (code: string, amount: number, by = owner, order?: string, key?: string) =>
  call<Redemption>(user(by), "select public.redeem_gift_card($1, $2, $3, null, $4, $5) as result", [
    businessId,
    code,
    amount,
    order ?? (await newOrder()),
    key ?? null,
  ]);

const card = async (id: string) =>
  (
    await db.query<{ status: string; balance_cents: number; code_hash: string | null }>(
      "select status, balance_cents, code_hash from public.gift_cards where id = $1",
      [id],
    )
  ).rows[0]!;

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  manager = await createUser(db, "Manager");
  staff = await createUser(db, "Staff");
  outsider = await createUser(db, "Outsider");
  businessId = await createBusiness(db, owner, "studio-gift", "Studio Gift");
  otherBusinessId = await createBusiness(db, outsider, "other-gift", "Other Gift");
  await addMember(db, businessId, manager, "manager");
  await addMember(db, businessId, staff, "staff");
  await db.query(
    "update public.businesses set gift_cards_enabled = true, gift_card_amounts = '{2500,5000}' where id = $1",
    [businessId],
  );
});

describe("selling and activating gift cards", () => {
  it("keeps an online order pending, without code or value, until payment is recorded", async () => {
    const order = await call<{ gift_card_id: string }>(
      server,
      "select public.create_online_gift_card($1, 5000, 'Buyer', 'buyer@example.test') as result",
      [businessId],
    );
    expect(await card(order.gift_card_id)).toEqual({
      status: "pending",
      balance_cents: 0,
      code_hash: null,
    });

    const activated = await call<{ code: string }>(
      user(owner),
      "select public.activate_gift_card($1, 'cash') as result",
      [order.gift_card_id],
    );
    expect(activated.code).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/);
    expect(await card(order.gift_card_id)).toMatchObject({ status: "active", balance_cents: 5000 });
  });

  it("refuses a second activation, so a repeated confirmation never credits twice", async () => {
    const order = await call<{ gift_card_id: string }>(
      server,
      "select public.create_online_gift_card($1, 2500, 'Buyer', null) as result",
      [businessId],
    );
    const activate = () =>
      call(user(owner), "select public.activate_gift_card($1, 'card') as result", [
        order.gift_card_id,
      ]);
    await activate();
    await expect(activate()).rejects.toThrow(/gift_card_not_pending/);
    const ledger = await db.query(
      "select id from public.gift_card_transactions where gift_card_id = $1",
      [order.gift_card_id],
    );
    expect(ledger.rows).toHaveLength(1);
  });

  it("only accepts amounts the salon offers online, and only when enabled", async () => {
    await expect(
      call(server, "select public.create_online_gift_card($1, 1234, 'Buyer', null) as result", [
        businessId,
      ]),
    ).rejects.toThrow(/gift_card_amount_invalid/);
    await expect(
      call(server, "select public.create_online_gift_card($1, 2500, 'Buyer', null) as result", [
        otherBusinessId,
      ]),
    ).rejects.toThrow(/gift_cards_unavailable/);
    await expect(
      call(
        user(owner),
        "select public.create_online_gift_card($1, 2500, 'Buyer', null) as result",
        [businessId],
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("generates unique, non-sequential codes and stores only their hash", async () => {
    const codes = new Set<string>();
    for (let i = 0; i < 20; i++) codes.add((await sellAtDesk(2500)).code);
    expect(codes.size).toBe(20);
    const stored = await db.query<{ code_hash: string; code_last4: string }>(
      "select code_hash, code_last4 from public.gift_cards where code_hash is not null",
    );
    for (const row of stored.rows) {
      expect(row.code_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(codes.has(row.code_hash)).toBe(false);
    }
  });

  it("lets only gift card managers sell and activate", async () => {
    await expect(sellAtDesk(2500, staff)).rejects.toThrow(/permission/);
    await expect(sellAtDesk(2500, outsider)).rejects.toThrow(/permission/);
    await expect(sellAtDesk(2500, manager)).resolves.toMatchObject({ code: expect.any(String) });
  });
});

describe("redeeming gift cards", () => {
  it("keeps the remaining balance after a partial redemption and records revenue", async () => {
    const { code } = await sellAtDesk(5000);
    const first = await redeem(code, 1800);
    expect(first.balance_cents).toBe(3200);
    expect(first.payment_id).not.toBeNull();
    const payment = await db.query<{ method: string; amount_cents: number }>(
      "select method, amount_cents from public.payments where id = $1",
      [first.payment_id],
    );
    expect(payment.rows[0]).toEqual({ method: "voucher", amount_cents: 1800 });
  });

  it("accepts codes typed in lower case, with spaces or with look-alike letters", async () => {
    const { code } = await sellAtDesk(2500);
    const typed = ` ${code.toLowerCase().replace(/-/g, " ").replace(/0/g, "o").replace(/1/g, "l")} `;
    await expect(redeem(typed, 100)).resolves.toMatchObject({ balance_cents: 2400 });
  });

  it("prevents reuse once fully redeemed and never goes below zero", async () => {
    const { code } = await sellAtDesk(2500);
    await redeem(code, 2000);
    await expect(redeem(code, 600)).rejects.toThrow(/gift_card_insufficient/);
    await redeem(code, 500);
    await expect(redeem(code, 1)).rejects.toThrow(/gift_card_empty/);
  });

  it("serialises redemptions so two of them can never overspend", async () => {
    const { code } = await sellAtDesk(3000);
    const order = await newOrder();
    const results = await Promise.allSettled([
      redeem(code, 2000, owner, order),
      redeem(code, 2000, owner, order),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const { rows } = await db.query<{ balance_cents: number }>(
      "select balance_cents from public.gift_cards where code_hash = public.gift_card_hash($1)",
      [code],
    );
    expect(rows[0]!.balance_cents).toBe(1000);
  });

  it("rejects unknown, other salons', blocked, cancelled and expired cards", async () => {
    await expect(redeem("ZZZZ-ZZZZ-ZZZZ-ZZZZ", 100)).rejects.toThrow(/gift_card_invalid/);

    const foreign = await sellAtDesk(2500, outsider, otherBusinessId);
    await expect(redeem(foreign.code, 100)).rejects.toThrow(/gift_card_invalid/);

    const blocked = await sellAtDesk(2500);
    await call(
      user(owner),
      "select public.set_gift_card_blocked($1, true, 'Reported lost') as result",
      [blocked.gift_card_id],
    );
    await expect(redeem(blocked.code, 100)).rejects.toThrow(/gift_card_blocked/);

    const cancelled = await sellAtDesk(2500);
    await call(
      user(owner),
      "select public.cancel_gift_card($1, 'Refunded at the desk') as result",
      [cancelled.gift_card_id],
    );
    await expect(redeem(cancelled.code, 100)).rejects.toThrow(/gift_card_invalid/);

    const expired = await sellAtDesk(2500);
    await db.query(
      "update public.gift_cards set expires_at = now() - interval '1 day' where id = $1",
      [expired.gift_card_id],
    );
    await expect(redeem(expired.code, 100)).rejects.toThrow(/gift_card_expired/);
  });

  it("keeps cards and their history private to the salon's managers and finance", async () => {
    await sellAtDesk(2500);
    for (const viewer of [staff, outsider]) {
      const seen = await as(db, user(viewer), (tx) =>
        tx.query(
          "select g.id from public.gift_cards g where g.business_id = $1 union all select t.gift_card_id from public.gift_card_transactions t where t.business_id = $1",
          [businessId],
        ),
      );
      expect(seen.rows).toHaveLength(0);
    }
    await expect(
      as(db, user(owner), (tx) =>
        tx.query("update public.gift_cards set balance_cents = 999999 where business_id = $1", [
          businessId,
        ]),
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(redeem("ZZZZ-ZZZZ-ZZZZ-ZZZZ", 100, outsider)).rejects.toThrow(/permission/);
  });

  it("only records revenue on plans with the finance module", async () => {
    // Shop orders need Pro, so the order exists before the salon moves to Basic.
    const order = await newOrder();
    await db.query(
      "update public.business_subscriptions set plan_id = 'basic', status = 'active' where business_id = $1",
      [businessId],
    );
    try {
      const { code } = await sellAtDesk(2500);
      const result = await redeem(code, 1000, owner, order);
      expect(result.payment_id).toBeNull();
      expect(result.balance_cents).toBe(1500);
    } finally {
      await db.query(
        "update public.business_subscriptions set plan_id = 'pro', status = 'trialing' where business_id = $1",
        [businessId],
      );
    }
  });
});

describe("correcting gift cards", () => {
  it("reverses a redemption once, restores the balance and refunds the linked payment", async () => {
    const { code, gift_card_id } = await sellAtDesk(4000);
    const spent = await redeem(code, 1500);
    const reverse = () =>
      call(
        user(owner),
        "select public.reverse_gift_card_redemption($1, 'Wrong client') as result",
        [spent.transaction_id],
      );
    await reverse();
    await expect(reverse()).rejects.toThrow(/gift_card_already_reversed/);
    expect((await card(gift_card_id)).balance_cents).toBe(4000);
    const payment = await db.query<{ status: string }>(
      "select status from public.payments where id = $1",
      [spent.payment_id],
    );
    expect(payment.rows[0]!.status).toBe("refunded");
  });

  it("requires a reason and keeps every correction in the ledger and audit log", async () => {
    const { gift_card_id } = await sellAtDesk(2500);
    await expect(
      call(user(owner), "select public.adjust_gift_card($1, 500, '') as result", [gift_card_id]),
    ).rejects.toThrow(/gift_card_reason_required/);
    await call(user(owner), "select public.adjust_gift_card($1, -500, 'Typo at sale') as result", [
      gift_card_id,
    ]);
    await expect(
      call(user(owner), "select public.adjust_gift_card($1, -5000, 'Too much') as result", [
        gift_card_id,
      ]),
    ).rejects.toThrow(/gift_card_amount_invalid/);

    const ledger = await db.query<{
      kind: string;
      amount_cents: number;
      balance_after_cents: number;
    }>(
      "select kind, amount_cents, balance_after_cents from public.gift_card_transactions where gift_card_id = $1 order by id",
      [gift_card_id],
    );
    expect(ledger.rows).toEqual([
      { kind: "issue", amount_cents: 2500, balance_after_cents: 2500 },
      { kind: "adjustment", amount_cents: -500, balance_after_cents: 2000 },
    ]);
    const audit = await db.query(
      "select id from public.audit_events where entity_id = $1 and action = 'gift_card.adjusted'",
      [gift_card_id],
    );
    expect(audit.rows).toHaveLength(1);
  });

  it("writes off the remaining value when a card is cancelled", async () => {
    const { gift_card_id } = await sellAtDesk(2500);
    await call(
      user(owner),
      "select public.cancel_gift_card($1, 'Refunded at the desk') as result",
      [gift_card_id],
    );
    expect(await card(gift_card_id)).toMatchObject({ status: "cancelled", balance_cents: 0 });
    await expect(
      call(user(manager), "select public.cancel_gift_card($1, 'Again') as result", [gift_card_id]),
    ).rejects.toThrow(/gift_card_status_unchanged/);
  });
});

describe("holder view", () => {
  it("shows balance and history for a valid code at the right salon only", async () => {
    const { code } = await sellAtDesk(5000);
    await redeem(code, 1000);
    const view = await call<{ balance_cents: number; status: string; history: unknown[] }>(
      server,
      "select public.get_gift_card_by_code('studio-gift', $1) as result",
      [code],
    );
    expect(view).toMatchObject({ balance_cents: 4000, status: "active" });
    expect(view.history).toHaveLength(2);

    const elsewhere = await call(
      server,
      "select public.get_gift_card_by_code('other-gift', $1) as result",
      [code],
    );
    expect(elsewhere).toBeNull();
    await expect(
      call({ role: "anon" }, "select public.get_gift_card_by_code('studio-gift', $1) as result", [
        code,
      ]),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("fixes after review", () => {
  it("lets the salon cancel an online order that was never paid", async () => {
    const order = await call<{ gift_card_id: string }>(
      server,
      "select public.create_online_gift_card($1, 2500, 'Buyer', null) as result",
      [businessId],
    );
    await call(user(owner), "select public.cancel_gift_card($1, 'Never paid') as result", [
      order.gift_card_id,
    ]);
    expect(await card(order.gift_card_id)).toMatchObject({ status: "cancelled", code_hash: null });
  });

  it("never redeems more than is still due, whoever redeems and whatever they can read", async () => {
    // A manager without gift card access can't read the ledger, but the cap lives in the database.
    await db.query(
      "update public.business_members set revoked_permissions = '{gift_cards.manage}' where user_id = $1",
      [manager],
    );
    const order = await newOrder(9000);
    const first = await sellAtDesk(9000);
    const second = await sellAtDesk(9000);
    await redeem(first.code, 9000, manager, order);
    await expect(redeem(second.code, 100, manager, order)).rejects.toThrow(/gift_card_exceeds_due/);
    const due = await call<number>(
      user(manager),
      "select public.gift_card_purchase_due($1, null, $2) as result",
      [businessId, order],
    );
    expect(due).toBe(0);
    await db.query(
      "update public.business_members set revoked_permissions = '{}' where user_id = $1",
      [manager],
    );
  });

  it("refuses redemptions against settled or cancelled orders", async () => {
    const { code } = await sellAtDesk(2500);
    const paid = await newOrder(2000);
    await db.query("update public.orders set payment_status = 'paid' where id = $1", [paid]);
    await expect(redeem(code, 500, owner, paid)).rejects.toThrow(/gift_card_purchase_closed/);
  });

  it("only refunds a redemption's payment through a reversal", async () => {
    const { code } = await sellAtDesk(3000);
    const spent = await redeem(code, 1000);
    await expect(
      as(db, user(owner), (tx) =>
        tx.query(
          "update public.payments set status = 'refunded', refunded_at = now(), refunded_by = $2 where id = $1",
          [spent.payment_id, owner],
        ),
      ),
    ).rejects.toThrow(/payment_linked_to_gift_card/);
    await call(
      user(owner),
      "select public.reverse_gift_card_redemption($1, 'Wrong client') as result",
      [spent.transaction_id],
    );
    const payment = await db.query<{ status: string }>(
      "select status from public.payments where id = $1",
      [spent.payment_id],
    );
    expect(payment.rows[0]!.status).toBe("refunded");
  });

  it("does nothing twice when a sale, redemption or correction is retried", async () => {
    const saleKey = "11111111-1111-4111-8111-000000000001";
    const sale = () =>
      call<{ gift_card_id: string; code: string | null; duplicate?: boolean }>(
        user(owner),
        "select public.create_desk_gift_card($1, 2500, 'card', 'Buyer', null, null, null, $2) as result",
        [businessId, saleKey],
      );
    const firstSale = await sale();
    const retriedSale = await sale();
    expect(retriedSale).toMatchObject({
      gift_card_id: firstSale.gift_card_id,
      code: null,
      duplicate: true,
    });

    const order = await newOrder();
    const redeemKey = "11111111-1111-4111-8111-000000000002";
    await redeem(firstSale.code!, 1000, owner, order, redeemKey);
    const retried = await redeem(firstSale.code!, 1000, owner, order, redeemKey);
    expect(retried).toMatchObject({ balance_cents: 1500, duplicate: true });

    const adjustKey = "11111111-1111-4111-8111-000000000003";
    for (let i = 0; i < 2; i++)
      await call(user(owner), "select public.adjust_gift_card($1, 500, 'Goodwill', $2) as result", [
        firstSale.gift_card_id,
        adjustKey,
      ]);
    expect((await card(firstSale.gift_card_id)).balance_cents).toBe(2000);
  });

  it("keeps every card's balance equal to the sum of its ledger", async () => {
    const mismatches = await db.query(
      `select g.number from public.gift_cards g
       left join public.gift_card_transactions t on t.gift_card_id = g.id
       group by g.id
       having g.balance_cents <> coalesce(sum(t.amount_cents), 0)`,
    );
    expect(mismatches.rows).toEqual([]);
  });
});
