import { beforeAll, describe, expect, it } from "vitest";

import { addMember, as, createBusiness, createTestDatabase, createUser, type TestDatabase } from "./harness";

let db: TestDatabase;
let owner: string;
let anna: string;
let ben: string;
let outsider: string;
let businessId: string;
let annaStaff: string;
let benStaff: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });
const run = (userId: string, sql: string, params: unknown[] = []) =>
  as(db, user(userId), (tx) => tx.query(sql, params), { commit: true });

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  anna = await createUser(db, "Anna");
  ben = await createUser(db, "Ben");
  outsider = await createUser(db, "Outsider");
  businessId = await createBusiness(db, owner, "studio-clock", "Studio Clock");
  await addMember(db, businessId, anna, "staff");
  await addMember(db, businessId, ben, "staff");
  const { rows } = await db.query<{ id: string; display_name: string }>(
    `insert into public.staff_members (business_id, user_id, display_name)
     values ($1, $2, 'Anna'), ($1, $3, 'Ben') returning id, display_name`,
    [businessId, anna, ben],
  );
  annaStaff = rows.find((row) => row.display_name === "Anna")!.id;
  benStaff = rows.find((row) => row.display_name === "Ben")!.id;
});

describe("time clock", () => {
  it("lets a professional clock in once and clock out", async () => {
    await run(anna, "select public.clock_in($1)", [businessId]);
    await expect(run(anna, "select public.clock_in($1)", [businessId])).rejects.toThrow(/already_clocked_in/);
    await run(anna, "select public.clock_out($1)", [businessId]);
    await expect(run(anna, "select public.clock_out($1)", [businessId])).rejects.toThrow(/not_clocked_in/);
    const { rows } = await db.query<{ open: number; closed: number }>(
      `select count(*) filter (where clock_out is null)::int as open, count(*) filter (where clock_out is not null)::int as closed
       from public.time_entries where staff_id = $1`,
      [annaStaff],
    );
    expect(rows[0]).toEqual({ open: 0, closed: 1 });
  });

  it("needs a linked staff profile", async () => {
    await expect(run(owner, "select public.clock_in($1)", [businessId])).rejects.toThrow(/linked staff profile/);
    await expect(run(outsider, "select public.clock_in($1)", [businessId])).rejects.toThrow(/linked staff profile/);
  });

  it("shows staff only their own hours and managers everyone's", async () => {
    await run(ben, "select public.clock_in($1)", [businessId]);
    const visible = async (userId: string) =>
      (
        await as(db, user(userId), (tx) =>
          tx.query<{ staff_id: string }>("select distinct staff_id from public.time_entries order by staff_id"),
        )
      ).rows.map((row) => row.staff_id);
    expect(await visible(anna)).toEqual([annaStaff]);
    expect(await visible(ben)).toEqual([benStaff]);
    expect((await visible(owner)).sort()).toEqual([annaStaff, benStaff].sort());
    expect(await visible(outsider)).toEqual([]);
  });

  it("only allows writes through the functions", async () => {
    await expect(
      run(anna, "insert into public.time_entries (business_id, staff_id, clock_in) values ($1, $2, now())", [
        businessId,
        annaStaff,
      ]),
    ).rejects.toThrow(/permission denied/);
    await expect(
      run(anna, "update public.time_entries set clock_in = clock_in - interval '1 hour' where staff_id = $1", [
        annaStaff,
      ]),
    ).rejects.toThrow(/permission denied/);
  });

  it("lets managers correct entries, without overlaps, and logs it", async () => {
    await expect(
      run(anna, "select public.save_time_entry($1, $2, now() - interval '3 hours', now() - interval '2 hours', 'x')", [
        businessId,
        annaStaff,
      ]),
    ).rejects.toThrow(/permission/);
    await run(
      owner,
      "select public.save_time_entry($1, $2, now() - interval '30 hours', now() - interval '26 hours', 'Forgot to clock in')",
      [businessId, annaStaff],
    );
    await expect(
      run(owner, "select public.save_time_entry($1, $2, now() - interval '29 hours', now() - interval '28 hours')", [
        businessId,
        annaStaff,
      ]),
    ).rejects.toThrow(/time_entries_no_overlap/);
    const audit = await db.query("select 1 from public.audit_events where action = 'time_entry.saved'");
    expect(audit.rows).toHaveLength(1);
  });

  it("is part of Pro, not Basic", async () => {
    const admin = await createUser(db, "Admin");
    await db.query("insert into public.platform_admins (user_id) values ($1)", [admin]);
    await run(admin, "select public.admin_set_subscription($1, 'basic', 'active', 'Plan test')", [businessId]);
    await expect(run(ben, "select public.clock_out($1)", [businessId])).rejects.toThrow(/plan_feature_time_clock/);
  });
});
