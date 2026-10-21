import { beforeAll, describe, expect, it } from "vitest";

import { ALL_PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/auth/permissions";

import {
  addMember,
  as,
  createBusiness,
  createTestDatabase,
  createUser,
  type TestDatabase,
} from "./harness";

let db: TestDatabase;
let ownerA: string;
let ownerB: string;
let managerA: string;
let staffA: string;
let stranger: string;
let admin: string;
let businessA: string;
let businessB: string;

beforeAll(async () => {
  db = await createTestDatabase();
  ownerA = await createUser(db, "Owner A");
  ownerB = await createUser(db, "Owner B");
  managerA = await createUser(db, "Manager A");
  staffA = await createUser(db, "Staff A");
  stranger = await createUser(db, "Stranger");
  admin = await createUser(db, "Platform Admin");
  await db.query("insert into public.platform_admins (user_id) values ($1)", [admin]);

  businessA = await createBusiness(db, ownerA, "studio-a", "Studio A");
  businessB = await createBusiness(db, ownerB, "studio-b", "Studio B");
  await addMember(db, businessA, managerA, "manager");
  await addMember(db, businessA, staffA, "staff");
});

const user = (userId: string) => ({ role: "authenticated" as const, userId });

describe("permission catalogue", () => {
  it("matches the TypeScript permission model exactly", async () => {
    const { rows: keys } = await db.query<{ key: string }>(
      "select key from public.permissions order by key",
    );
    expect(keys.map((row) => row.key)).toEqual([...ALL_PERMISSIONS].sort());

    const { rows } = await db.query<{ role: "manager" | "staff"; permission: string }>(
      "select role::text as role, permission from public.role_permissions order by role, permission",
    );
    for (const role of ["manager", "staff"] as const) {
      expect(rows.filter((row) => row.role === role).map((row) => row.permission)).toEqual(
        [...ROLE_PERMISSIONS[role]].sort(),
      );
    }
  });
});

describe("sign-up and business creation", () => {
  it("creates a profile for every new auth user", async () => {
    const { rows } = await db.query<{ full_name: string }>(
      "select full_name from public.profiles where id = $1",
      [ownerA],
    );
    expect(rows[0]?.full_name).toBe("Owner A");
  });

  it("creates the owner membership, first location and an audit event atomically", async () => {
    const membership = await db.query(
      "select role from public.business_members where business_id = $1 and user_id = $2",
      [businessA, ownerA],
    );
    expect(membership.rows).toEqual([{ role: "owner" }]);
    const locations = await db.query("select name from public.locations where business_id = $1", [
      businessA,
    ]);
    expect(locations.rows).toEqual([{ name: "Studio A" }]);
    const audit = await db.query("select action from public.audit_events where business_id = $1", [
      businessA,
    ]);
    expect(audit.rows).toEqual([{ action: "business.created" }]);
  });

  it("rejects anonymous callers, taken slugs, invalid slugs and unknown time zones", async () => {
    await expect(
      as(db, { role: "anon" }, (tx) =>
        tx.query("select public.create_business('X Studio', 'x-studio')"),
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(createBusiness(db, stranger, "studio-a")).rejects.toThrow(/duplicate key/);
    await expect(createBusiness(db, stranger, "Bad Slug!")).rejects.toThrow(/check constraint/);
    await expect(
      as(db, user(stranger), (tx) =>
        tx.query(
          "select public.create_business('Zone Studio', 'zone-studio', 'other', 'Mars/Olympus')",
        ),
      ),
    ).rejects.toThrow(/Unknown time zone/);
  });
});

describe("tenant isolation", () => {
  it("only shows a user the businesses they belong to", async () => {
    const seen = await as(db, user(ownerA), (tx) =>
      tx.query<{ slug: string }>("select slug from public.businesses order by slug"),
    );
    expect(seen.rows.map((row) => row.slug)).toEqual(["studio-a"]);

    const strangerSees = await as(db, user(stranger), (tx) =>
      tx.query("select id from public.businesses"),
    );
    expect(strangerSees.rows).toHaveLength(0);
  });

  it("blocks reading or changing another tenant's data by id", async () => {
    const members = await as(db, user(ownerA), (tx) =>
      tx.query("select * from public.business_members where business_id = $1", [businessB]),
    );
    expect(members.rows).toHaveLength(0);

    const update = await as(db, user(ownerA), (tx) =>
      tx.query("update public.businesses set name = 'Hijacked' where id = $1", [businessB]),
    );
    expect(update.affectedRows).toBe(0);

    await expect(
      as(db, user(ownerA), (tx) =>
        tx.query("insert into public.locations (business_id, name) values ($1, 'Rogue')", [
          businessB,
        ]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("gives anonymous visitors no direct table access", async () => {
    await expect(
      as(db, { role: "anon" }, (tx) => tx.query("select * from public.businesses")),
    ).rejects.toThrow(/permission denied/);
    await expect(
      as(db, { role: "anon" }, (tx) => tx.query("select * from public.profiles")),
    ).rejects.toThrow(/permission denied/);
  });

  it("lets co-members see each other's profile but not strangers'", async () => {
    const result = await as(db, user(staffA), (tx) =>
      tx.query<{ id: string }>("select id from public.profiles"),
    );
    const ids = result.rows.map((row) => row.id);
    expect(ids).toEqual(expect.arrayContaining([ownerA, managerA, staffA]));
    expect(ids).not.toContain(ownerB);
  });
});

describe("roles and permissions", () => {
  const rename = (userId: string, name: string) =>
    as(db, user(userId), (tx) =>
      tx.query("update public.businesses set name = $2 where id = $1", [businessA, name]),
    );

  it("lets owners edit settings but not managers or staff by default", async () => {
    expect((await rename(ownerA, "Studio A+")).affectedRows).toBe(1);
    expect((await rename(managerA, "Manager rename")).affectedRows).toBe(0);
    expect((await rename(staffA, "Staff rename")).affectedRows).toBe(0);
  });

  it("applies per-member grants and revocations", async () => {
    const granted = await createUser(db, "Granted");
    const revoked = await createUser(db, "Revoked");
    await addMember(db, businessA, granted, "staff", { granted: ["settings.manage"] });
    await addMember(db, businessA, revoked, "manager", { revoked: ["customers.view"] });

    expect((await rename(granted, "Granted rename")).affectedRows).toBe(1);
    const check = await as(db, user(revoked), (tx) =>
      tx.query<{ allowed: boolean }>(
        "select public.has_business_permission($1, 'customers.view') as allowed",
        [businessA],
      ),
    );
    expect(check.rows[0]?.allowed).toBe(false);
  });

  it("rejects unknown permission keys in overrides", async () => {
    const other = await createUser(db);
    await expect(
      addMember(db, businessA, other, "staff", { granted: ["everything.all"] }),
    ).rejects.toThrow(/Unknown permission/);
  });

  it("never lets clients change a business's status column", async () => {
    await expect(
      as(db, user(ownerA), (tx) =>
        tx.query("update public.businesses set status = 'closed' where id = $1", [businessA]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("keeps at least one active owner", async () => {
    await expect(
      db.query(
        "update public.business_members set role = 'staff' where business_id = $1 and user_id = $2",
        [businessB, ownerB],
      ),
    ).rejects.toThrow(/at least one active owner/);
  });

  it("reports a member's effective permissions", async () => {
    const result = await as(db, user(staffA), (tx) =>
      tx.query<{ permissions: string[] }>(
        "select public.my_business_permissions($1) as permissions",
        [businessA],
      ),
    );
    expect(result.rows[0]?.permissions).toEqual([...ROLE_PERMISSIONS.staff].sort());
  });
});

describe("platform administration", () => {
  it("lets platform admins read every business", async () => {
    const result = await as(db, user(admin), (tx) => tx.query("select id from public.businesses"));
    expect(result.rows.length).toBeGreaterThanOrEqual(2);
  });

  it("only lets platform admins change a business status, with an audit trail", async () => {
    await expect(
      as(db, user(ownerB), (tx) =>
        tx.query("select public.admin_set_business_status($1, 'suspended', 'Testing access')", [
          businessB,
        ]),
      ),
    ).rejects.toThrow(/Platform administrator access required/);

    await as(
      db,
      user(admin),
      (tx) =>
        tx.query("select public.admin_set_business_status($1, 'suspended', 'Unpaid invoices')", [
          businessB,
        ]),
      { commit: true },
    );
    const audit = await db.query<{ metadata: { to: string; reason: string } }>(
      "select metadata from public.audit_events where business_id = $1 and action = 'business.status_changed'",
      [businessB],
    );
    expect(audit.rows[0]?.metadata).toMatchObject({ to: "suspended", reason: "Unpaid invoices" });
  });

  it("keeps a suspended business readable but read-only for its members", async () => {
    const read = await as(db, user(ownerB), (tx) =>
      tx.query("select id from public.businesses where id = $1", [businessB]),
    );
    expect(read.rows).toHaveLength(1);
    const write = await as(db, user(ownerB), (tx) =>
      tx.query("update public.businesses set name = 'Still here' where id = $1", [businessB]),
    );
    expect(write.affectedRows).toBe(0);
  });
});

describe("platform admin least privilege", () => {
  it("gives platform admins aggregate statistics but no access to client records", async () => {
    const stats = await as(db, user(admin), (tx) =>
      tx.query<{ stats: Record<string, number> }>("select public.admin_platform_stats() as stats"),
    );
    expect(Number(stats.rows[0]!.stats.businesses_total)).toBeGreaterThanOrEqual(2);

    await db.query(
      "insert into public.customers (business_id, first_name, email) values ($1, 'Private', 'private@example.test')",
      [businessA],
    );
    const customers = await as(db, user(admin), (tx) =>
      tx.query("select id from public.customers"),
    );
    expect(customers.rows).toHaveLength(0);
  });

  it("refuses admin functions to everyone else", async () => {
    await expect(
      as(db, user(ownerA), (tx) => tx.query("select public.admin_platform_stats()")),
    ).rejects.toThrow(/Platform administrator/);
    await expect(
      as(db, user(ownerA), (tx) => tx.query("select * from public.admin_list_businesses()")),
    ).rejects.toThrow(/Platform administrator/);
  });

  it("lists businesses with their owner for support", async () => {
    const result = await as(db, user(admin), (tx) =>
      tx.query<{ slug: string; owner_email: string }>(
        "select slug, owner_email from public.admin_list_businesses()",
      ),
    );
    expect(result.rows.find((row) => row.slug === "studio-a")?.owner_email).toMatch(
      /@example\.test$/,
    );
  });
});
