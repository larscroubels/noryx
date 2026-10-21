import { beforeAll, describe, expect, it } from "vitest";

import { as, createBusiness, createTestDatabase, createUser, type TestDatabase } from "./harness";

let db: TestDatabase;
let owner: string;
let admin: string;
let businessId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });

function setPlan(by: string, plan: string, status = "active") {
  return as(
    db,
    user(by),
    (tx) =>
      tx.query("select public.admin_set_subscription($1, $2, $3, 'Plan change test')", [
        businessId,
        plan,
        status,
      ]),
    { commit: true },
  );
}

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  admin = await createUser(db, "Admin");
  await db.query("insert into public.platform_admins (user_id) values ($1)", [admin]);
  businessId = await createBusiness(db, owner, "studio-plans", "Studio Plans");
});

describe("plans and entitlements", () => {
  it("starts every new business on early access with all features", async () => {
    const { rows } = await as(db, user(owner), (tx) =>
      tx.query<{ plan_id: string; shop: boolean }>(
        "select plan_id, public.business_has_feature(business_id, 'shop') as shop from public.business_subscriptions",
      ),
    );
    expect(rows).toEqual([{ plan_id: "early_access", shop: true }]);
  });

  it("only lets platform admins change a plan, with an audit trail", async () => {
    await expect(setPlan(owner, "studio")).rejects.toThrow(/Platform administrator/);
    await db.query("update public.businesses set shop_enabled = true where id = $1", [businessId]);
    await setPlan(admin, "solo");
    const audit = await db.query(
      "select 1 from public.audit_events where action = 'subscription.changed'",
    );
    expect(audit.rows).toHaveLength(1);
  });

  it("switches the webshop off when the plan no longer includes it, and blocks re-enabling", async () => {
    const { rows } = await db.query<{ shop_enabled: boolean }>(
      "select shop_enabled from public.businesses where id = $1",
      [businessId],
    );
    expect(rows[0]!.shop_enabled).toBe(false);
    await expect(
      as(db, user(owner), (tx) =>
        tx.query("update public.businesses set shop_enabled = true where id = $1", [businessId]),
      ),
    ).rejects.toThrow(/plan_feature_shop/);
  });

  it("enforces the staff limit of the plan", async () => {
    const insertStaff = (name: string) =>
      as(
        db,
        user(owner),
        (tx) =>
          tx.query("insert into public.staff_members (business_id, display_name) values ($1, $2)", [
            businessId,
            name,
          ]),
        { commit: true },
      );
    await insertStaff("First professional");
    await expect(insertStaff("Second professional")).rejects.toThrow(/plan_limit_staff/);
    await setPlan(admin, "salon");
    await expect(insertStaff("Second professional")).resolves.toBeTruthy();
  });
});
