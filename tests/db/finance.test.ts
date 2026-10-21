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
let businessId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });

function record(userId: string, amount = 4500) {
  return as(
    db,
    user(userId),
    (tx) =>
      tx.query(
        "insert into public.payments (business_id, amount_cents, currency, method, recorded_by) values ($1, $2, 'EUR', 'card', $3)",
        [businessId, amount, userId],
      ),
    { commit: true },
  );
}

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  manager = await createUser(db, "Manager");
  staff = await createUser(db, "Staff");
  businessId = await createBusiness(db, owner, "studio-finance", "Studio Finance");
  await addMember(db, businessId, manager, "manager");
  await addMember(db, businessId, staff, "staff");
});

describe("finance access", () => {
  it("lets the front desk record payments without seeing any figures", async () => {
    await record(manager, 3200);
    const seen = await as(db, user(manager), (tx) => tx.query("select id from public.payments"));
    expect(seen.rows).toHaveLength(0);
  });

  it("shows figures to owners only by default", async () => {
    await record(owner, 5500);
    const ownerView = await as(db, user(owner), (tx) =>
      tx.query<{ total: number }>("select sum(amount_cents)::int as total from public.payments"),
    );
    expect(ownerView.rows[0]!.total).toBe(8700);
    const staffView = await as(db, user(staff), (tx) => tx.query("select id from public.payments"));
    expect(staffView.rows).toHaveLength(0);
  });

  it("stops staff without appointment rights from recording payments", async () => {
    await expect(record(staff)).rejects.toThrow(/row-level security/);
  });

  it("keeps payment amounts immutable and refunds explicit", async () => {
    await expect(
      as(db, user(owner), (tx) => tx.query("update public.payments set amount_cents = 1")),
    ).rejects.toThrow(/permission denied/);

    const refund = await as(db, user(owner), (tx) =>
      tx.query(
        "update public.payments set status = 'refunded', refunded_at = now(), refunded_by = $1 where amount_cents = 5500",
        [owner],
      ),
    );
    expect(refund.affectedRows).toBe(1);

    const managerRefund = await as(db, user(manager), (tx) =>
      tx.query("update public.payments set status = 'refunded', refunded_at = now()"),
    );
    expect(managerRefund.affectedRows).toBe(0);
  });

  it("restricts expenses to finance managers", async () => {
    await as(
      db,
      user(owner),
      (tx) =>
        tx.query(
          "insert into public.expenses (business_id, description, amount_cents, currency, spent_on, created_by) values ($1, 'Colour stock', 12000, 'EUR', current_date, $2)",
          [businessId, owner],
        ),
      { commit: true },
    );
    await expect(
      as(db, user(manager), (tx) =>
        tx.query(
          "insert into public.expenses (business_id, description, amount_cents, currency, spent_on) values ($1, 'x', 100, 'EUR', current_date)",
          [businessId],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });
});
