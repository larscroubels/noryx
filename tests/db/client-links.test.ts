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
let staff: string;
let businessId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });

async function call<T = Record<string, unknown>>(
  userId: string,
  sql: string,
  params: unknown[] = [],
) {
  return as(
    db,
    user(userId),
    async (tx) => (await tx.query<{ result: T }>(sql, params)).rows[0]?.result as T,
    { commit: true },
  );
}

type LinkResult = { error?: string; business_id?: string; name?: string; categories?: string[] };
const link = (userId: string, code: string, categories = "{hair}") =>
  call<LinkResult>(
    userId,
    "select public.link_business_by_code($1, $2::public.client_category[]) as result",
    [code, categories],
  );
const codeOf = (business = businessId, by = owner) =>
  call<string>(by, "select public.ensure_connection_code($1) as result", [business]);
const emailOf = async (userId: string) =>
  (await db.query<{ email: string }>("select email from auth.users where id = $1", [userId]))
    .rows[0]!.email;

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  staff = await createUser(db, "Staff");
  businessId = await createBusiness(db, owner, "studio-link", "Studio Link");
  await addMember(db, businessId, staff, "staff");
});

describe("connection codes", () => {
  it("gives every salon one active, readable code", async () => {
    const first = await codeOf();
    const second = await codeOf(businessId, staff);
    // Up to four letters from the slug "studio-link".
    expect(first).toMatch(/^STUD-\d{4}$/);
    expect(second).toBe(first);
  });

  it("regenerating invalidates the old code but keeps existing links", async () => {
    const client = await createUser(db, "Early Client");
    const old = await codeOf();
    expect((await link(client, old)).error).toBeUndefined();
    const fresh = await call<string>(
      owner,
      "select public.regenerate_connection_code($1) as result",
      [businessId],
    );
    expect(fresh).not.toBe(old);
    const late = await createUser(db, "Late Client");
    expect((await link(late, old)).error).toBe("connection_code_invalid");
    const links = await call<unknown[]>(
      client,
      "select coalesce(jsonb_agg(l), '[]') as result from public.my_client_links() l",
    );
    expect(links).toHaveLength(1);
    await expect(
      call(staff, "select public.regenerate_connection_code($1) as result", [businessId]),
    ).rejects.toThrow(/permission/);
  });
});

describe("linking a salon", () => {
  it("requires a confirmed email", async () => {
    const client = await createUser(db, "Unconfirmed", { confirmed: false });
    expect((await link(client, await codeOf())).error).toBe("email_not_confirmed");
  });

  it("links with the salon's own code and reuses an existing customer by email", async () => {
    const client = await createUser(db, "Returning Client");
    const existing = (
      await db.query<{ id: string }>(
        "insert into public.customers (business_id, first_name, email) values ($1, 'Returning', $2) returning id",
        [businessId, await emailOf(client)],
      )
    ).rows[0]!.id;
    const result = await link(client, await codeOf());
    expect(result).toMatchObject({ business_id: businessId, name: "Studio Link" });
    const row = await db.query<{ customer_id: string; user_id: string }>(
      "select l.customer_id, c.user_id from public.client_links l join public.customers c on c.id = l.customer_id where l.user_id = $1",
      [client],
    );
    expect(row.rows[0]).toEqual({ customer_id: existing, user_id: client });
  });

  it("gives unknown and inactive codes the same error", async () => {
    const client = await createUser(db, "Guesser");
    expect((await link(client, "ZZZZ-0000")).error).toBe("connection_code_invalid");
    const inactive = (
      await db.query<{ code: string }>(
        "select code from public.business_connection_codes where business_id = $1 and not active limit 1",
        [businessId],
      )
    ).rows[0]!.code;
    expect((await link(client, inactive)).error).toBe("connection_code_invalid");
  });

  it("limits code attempts per user", async () => {
    const client = await createUser(db, "Brute Force");
    for (let i = 0; i < 10; i++) await link(client, `ABCD-${String(i).padStart(4, "0")}`);
    expect((await link(client, await codeOf())).error).toBe("too_many_attempts");
  });

  it("respects the Basic customer limit", async () => {
    const boss = await createUser(db, "Basic Owner");
    const full = await createBusiness(db, boss, "studio-full", "Studio Full");
    await db.query(
      "update public.business_subscriptions set plan_id = 'basic', status = 'active' where business_id = $1",
      [full],
    );
    await db.query(
      "insert into public.customers (business_id, first_name) select $1, 'C' || g from generate_series(1, 250) g",
      [full],
    );
    const client = await createUser(db, "One Too Many");
    expect((await link(client, await codeOf(full, boss))).error).toBe("plan_limit_customers");
    const rows = await db.query("select id from public.client_links where user_id = $1", [client]);
    expect(rows.rows).toHaveLength(0);
  });

  it("lets one salon serve several categories", async () => {
    const client = await createUser(db, "Hair And Nails");
    expect((await link(client, await codeOf(), "{hair,nails}")).categories).toEqual([
      "hair",
      "nails",
    ]);
  });

  it("unlinks without touching salon data, and re-linking restores the link", async () => {
    const client = await createUser(db, "Leaving Client");
    await link(client, await codeOf());
    const before = await db.query<{ linked_at: string; customer_id: string }>(
      "select linked_at, customer_id from public.client_links where user_id = $1",
      [client],
    );
    await call(client, "select public.unlink_business($1) as result", [businessId]);
    const after = await db.query<{ unlinked_at: string | null }>(
      "select unlinked_at from public.client_links where user_id = $1",
      [client],
    );
    expect(after.rows[0]!.unlinked_at).not.toBeNull();
    const customer = await db.query("select id from public.customers where id = $1", [
      before.rows[0]!.customer_id,
    ]);
    expect(customer.rows).toHaveLength(1);
    await link(client, await codeOf());
    const relinked = await db.query<{ linked_at: string; unlinked_at: string | null }>(
      "select linked_at, unlinked_at from public.client_links where user_id = $1",
      [client],
    );
    expect(relinked.rows[0]).toEqual({ linked_at: before.rows[0]!.linked_at, unlinked_at: null });
  });

  it("keeps links private", async () => {
    const client = await createUser(db, "Private Client");
    await link(client, await codeOf());
    const stranger = await createUser(db, "Stranger");
    const seen = await as(db, user(stranger), (tx) =>
      tx.query("select id from public.client_links"),
    );
    expect(seen.rows).toHaveLength(0);
    await expect(
      as(db, { role: "anon" }, (tx) =>
        tx.query("select public.link_business_by_code('X', '{hair}'::public.client_category[])"),
      ),
    ).rejects.toThrow(/permission denied|does not exist/);
  });
});
