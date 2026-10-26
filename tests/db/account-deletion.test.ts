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
let businessId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });
const prepare = (userId: string) =>
  as(db, user(userId), (tx) => tx.query("select public.prepare_account_deletion()"), {
    commit: true,
  });

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  businessId = await createBusiness(db, owner, "studio-delete", "Studio Delete");
});

describe("account deletion", () => {
  it("refuses while the user is a business's only owner", async () => {
    await expect(prepare(owner)).rejects.toThrow(/account_owns_business/);
    const co = await createUser(db, "Co Owner");
    await addMember(db, businessId, co, "owner");
    await expect(prepare(co)).resolves.toBeDefined();
    const left = await db.query("select id from public.business_members where user_id = $1", [co]);
    expect(left.rows).toHaveLength(0);
  });

  it("detaches customer records and removes links", async () => {
    const code = await as(
      db,
      user(owner),
      async (tx) =>
        (
          await tx.query<{ code: string }>("select public.ensure_connection_code($1) as code", [
            businessId,
          ])
        ).rows[0]!.code,
      { commit: true },
    );
    const client = await createUser(db, "Leaving Client");
    await as(
      db,
      user(client),
      (tx) =>
        tx.query("select public.link_business_by_code($1, '{hair}'::public.client_category[])", [
          code,
        ]),
      { commit: true },
    );
    const customerId = (
      await db.query<{ customer_id: string }>(
        "select customer_id from public.client_links where user_id = $1",
        [client],
      )
    ).rows[0]!.customer_id;

    await prepare(client);

    const customer = await db.query<{ user_id: string | null }>(
      "select user_id from public.customers where id = $1",
      [customerId],
    );
    expect(customer.rows).toEqual([{ user_id: null }]);
    const links = await db.query("select id from public.client_links where user_id = $1", [client]);
    expect(links.rows).toHaveLength(0);
  });
});
