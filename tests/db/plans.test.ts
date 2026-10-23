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

const asOwner = (sql: string, params: unknown[] = []) =>
  as(db, user(owner), (tx) => tx.query(sql, params), { commit: true });

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  admin = await createUser(db, "Admin");
  await db.query("insert into public.platform_admins (user_id) values ($1)", [admin]);
  businessId = await createBusiness(db, owner, "studio-plans", "Studio Plans");
});

describe("Basic and Pro plans", () => {
  it("starts every new business with a 14-day Pro trial", async () => {
    const { rows } = await as(db, user(owner), (tx) =>
      tx.query<{ plan_id: string; status: string; days: number; plan: string; shop: boolean }>(
        `select plan_id, status::text, round(extract(epoch from trial_ends_at - now()) / 86400)::int as days,
                public.current_plan(business_id) as plan,
                public.business_has_feature(business_id, 'shop') as shop
         from public.business_subscriptions`,
      ),
    );
    expect(rows).toEqual([
      { plan_id: "pro", status: "trialing", days: 14, plan: "pro", shop: true },
    ]);
  });

  it("only shows the current plan to members", async () => {
    const stranger = await createUser(db, "Stranger");
    const { rows } = await as(db, user(stranger), (tx) =>
      tx.query<{ plan: string | null }>("select public.current_plan($1) as plan", [businessId]),
    );
    expect(rows[0]!.plan).toBeNull();
  });

  it("only lets platform admins change a plan, with an audit trail", async () => {
    await expect(setPlan(owner, "pro")).rejects.toThrow(/Platform administrator/);
    await db.query("update public.businesses set shop_enabled = true where id = $1", [businessId]);
    await setPlan(admin, "basic");
    const audit = await db.query(
      "select 1 from public.audit_events where action = 'subscription.changed'",
    );
    expect(audit.rows).toHaveLength(1);
  });

  it("switches the webshop off on Basic and blocks every Pro feature", async () => {
    const { rows } = await db.query<{ shop_enabled: boolean }>(
      "select shop_enabled from public.businesses where id = $1",
      [businessId],
    );
    expect(rows[0]!.shop_enabled).toBe(false);
    await expect(
      asOwner("update public.businesses set shop_enabled = true where id = $1", [businessId]),
    ).rejects.toThrow(/plan_feature_shop/);
    await expect(
      asOwner("update public.businesses set brand_color = '#B83D5D' where id = $1", [businessId]),
    ).rejects.toThrow(/plan_feature_branding/);
    await expect(
      asOwner(
        "insert into public.products (business_id, name, price_cents) values ($1, 'Mask', 2000)",
        [businessId],
      ),
    ).rejects.toThrow(/plan_feature_inventory/);
    await expect(
      asOwner(
        "insert into public.expenses (business_id, category, description, amount_cents, spent_on) values ($1, 'rent', 'Rent', 1000, current_date)",
        [businessId],
      ),
    ).rejects.toThrow(/plan_feature_finance/);
  });

  it("still allows removing branding on Basic", async () => {
    await expect(
      asOwner("update public.businesses set brand_color = null, logo_path = null where id = $1", [
        businessId,
      ]),
    ).resolves.toBeTruthy();
  });

  it("limits Basic to 250 customers", async () => {
    await db.query(
      `insert into public.customers (business_id, first_name)
       select $1, 'Client ' || i from generate_series(1, 249) as i`,
      [businessId],
    );
    const insertCustomer = (name: string) =>
      asOwner("insert into public.customers (business_id, first_name) values ($1, $2)", [
        businessId,
        name,
      ]);
    await expect(insertCustomer("Number 250")).resolves.toBeTruthy();
    await expect(insertCustomer("Number 251")).rejects.toThrow(/plan_limit_customers/);
    await setPlan(admin, "pro");
    await expect(insertCustomer("Number 251")).resolves.toBeTruthy();
  });

  it("falls back to Basic when a trial ends without a plan", async () => {
    await setPlan(admin, "pro", "trialing");
    await db.query(
      "update public.business_subscriptions set trial_ends_at = now() - interval '1 minute' where business_id = $1",
      [businessId],
    );
    const { rows } = await as(db, user(owner), (tx) =>
      tx.query<{ plan: string; finance: boolean; booking: boolean }>(
        `select public.current_plan($1) as plan,
                public.business_has_feature($1, 'finance') as finance,
                public.business_has_feature($1, 'online_booking') as booking`,
        [businessId],
      ),
    );
    expect(rows).toEqual([{ plan: "basic", finance: false, booking: true }]);
  });

  it("hides branding on the public page without the branding feature", async () => {
    await setPlan(admin, "pro");
    await db.query(
      "update public.businesses set booking_enabled = true, logo_path = 'x/logo.png', brand_color = '#B83D5D' where id = $1",
      [businessId],
    );
    await setPlan(admin, "basic");
    const publicPage = () =>
      as(db, { role: "anon" }, (tx) =>
        tx.query<{ logo: string | null; colour: string | null }>(
          "select d ->> 'logo_path' as logo, d ->> 'brand_color' as colour from public.get_public_business('studio-plans') as d",
        ),
      );
    expect((await publicPage()).rows[0]).toEqual({ logo: null, colour: null });
    await setPlan(admin, "pro");
    expect((await publicPage()).rows[0]).toEqual({ logo: "x/logo.png", colour: "#B83D5D" });
  });

  it("has two plans, with the own-domain website as an extra on Pro", async () => {
    const { rows } = await db.query<{ id: string; domain: boolean }>(
      "select id, 'custom_domain' = any (features) as domain from public.plans order by sort_order",
    );
    expect(rows).toEqual([
      { id: "basic", domain: false },
      { id: "pro", domain: true },
    ]);
  });

  it("maps a custom domain to the business page only on Pro, assigned by a platform admin", async () => {
    const resolve = (host: string) =>
      as(db, { role: "anon" }, (tx) =>
        tx.query<{ slug: string | null }>("select public.resolve_custom_domain($1) as slug", [host]),
      );
    const assign = (by: string, domain: string) =>
      as(db, user(by), (tx) => tx.query("select public.admin_set_custom_domain($1, $2, 'Own domain')", [businessId, domain]), {
        commit: true,
      });
    await expect(assign(owner, "studioplans.be")).rejects.toThrow(/Platform administrator/);
    await setPlan(admin, "basic");
    await expect(assign(admin, "studioplans.be")).rejects.toThrow(/plan_feature_custom_domain/);

    await setPlan(admin, "pro");
    await assign(admin, "https://www.StudioPlans.be");
    expect((await resolve("www.studioplans.be:443")).rows[0]!.slug).toBe("studio-plans");
    expect((await resolve("other.be")).rows[0]!.slug).toBeNull();

    // Back on Basic, the domain stops working but can still be removed.
    await setPlan(admin, "basic");
    expect((await resolve("studioplans.be")).rows[0]!.slug).toBeNull();
    await assign(admin, "");
  });
});
