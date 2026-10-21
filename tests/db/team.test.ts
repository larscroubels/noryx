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
let staffUser: string;
let businessId: string;
let staffProfileId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });
const emailOf = async (userId: string) =>
  (await db.query<{ email: string }>("select email from auth.users where id = $1", [userId]))
    .rows[0]!.email;

async function invite(by: string, email: string, role: string, staffId: string | null = null) {
  const { rows } = await as(
    db,
    user(by),
    (tx) =>
      tx.query<{ token: string }>("select public.create_invitation($1, $2, $3, $4) as token", [
        businessId,
        email,
        role,
        staffId,
      ]),
    { commit: true },
  );
  return rows[0]!.token;
}

const accept = (userId: string, token: string) =>
  as(db, user(userId), (tx) => tx.query("select public.accept_invitation($1)", [token]), {
    commit: true,
  });

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  manager = await createUser(db, "Manager");
  staffUser = await createUser(db, "Invited Stylist");
  businessId = await createBusiness(db, owner, "studio-team", "Studio Team");
  await addMember(db, businessId, manager, "manager", { granted: ["members.manage"] });
  const { rows } = await db.query<{ id: string }>(
    "insert into public.staff_members (business_id, display_name) values ($1, 'Invited Stylist') returning id",
    [businessId],
  );
  staffProfileId = rows[0]!.id;
});

describe("team invitations", () => {
  it("stores only a hash of the token", async () => {
    const token = await invite(owner, "someone@example.test", "staff");
    const { rows } = await db.query<{ token_hash: string }>(
      "select token_hash from public.business_invitations where email = 'someone@example.test'",
    );
    expect(rows[0]!.token_hash).not.toBe(token);
    expect(rows[0]!.token_hash).toHaveLength(64);
  });

  it("lets the invited user join and links their staff profile", async () => {
    const token = await invite(owner, await emailOf(staffUser), "staff", staffProfileId);
    const details = await as(db, { role: "anon" }, (tx) =>
      tx.query<{ info: { business_name: string; used: boolean } }>(
        "select public.get_invitation($1) as info",
        [token],
      ),
    );
    expect(details.rows[0]!.info).toMatchObject({ business_name: "Studio Team", used: false });

    await accept(staffUser, token);
    const { rows } = await db.query<{ role: string }>(
      "select role from public.business_members where business_id = $1 and user_id = $2",
      [businessId, staffUser],
    );
    expect(rows).toEqual([{ role: "staff" }]);
    const staff = await db.query<{ user_id: string }>(
      "select user_id from public.staff_members where id = $1",
      [staffProfileId],
    );
    expect(staff.rows[0]!.user_id).toBe(staffUser);
    await expect(accept(staffUser, token)).rejects.toThrow(/invitation_invalid/);
  });

  it("rejects acceptance by a different email address or after expiry", async () => {
    const other = await createUser(db, "Other");
    const token = await invite(owner, "intended@example.test", "staff");
    await expect(accept(other, token)).rejects.toThrow(/invitation_email_mismatch/);

    const late = await createUser(db, "Late");
    const lateToken = await invite(owner, await emailOf(late), "staff");
    await db.query(
      "update public.business_invitations set expires_at = now() - interval '1 minute' where lower(email) = lower($1)",
      [await emailOf(late)],
    );
    await expect(accept(late, lateToken)).rejects.toThrow(/invitation_expired/);
  });

  it("refuses invitations from people without members.manage", async () => {
    await expect(invite(staffUser, "x@example.test", "staff")).rejects.toThrow(
      /permission to invite/,
    );
  });

  it("only lets owners invite owners", async () => {
    await expect(invite(manager, "boss@example.test", "owner")).rejects.toThrow(
      /Only owners can invite/,
    );
  });
});

describe("member management", () => {
  const memberId = async (userId: string) =>
    (
      await db.query<{ id: string }>(
        "select id from public.business_members where business_id = $1 and user_id = $2",
        [businessId, userId],
      )
    ).rows[0]!.id;
  const update = async (by: string, target: string, role: string, granted: string[] = []) => {
    // Look the id up first: PGlite has one connection, so no queries outside the open transaction.
    const id = await memberId(target);
    return as(
      db,
      user(by),
      (tx) => tx.query("select public.update_member($1, $2, $3, '{}')", [id, role, granted]),
      { commit: true },
    );
  };

  it("blocks self-escalation", async () => {
    await expect(update(manager, manager, "owner")).rejects.toThrow(/your own role/);
  });

  it("stops non-owners from granting permissions they don't have", async () => {
    await expect(update(manager, staffUser, "staff", ["finance.view"])).rejects.toThrow(
      /permissions you have yourself/,
    );
    await expect(update(manager, staffUser, "staff", ["customers.view"])).resolves.toBeTruthy();
  });

  it("stops non-owners from touching owners", async () => {
    await expect(update(manager, owner, "staff")).rejects.toThrow(/Only owners/);
  });

  it("removes members and unlinks their staff profile but keeps it", async () => {
    const id = await memberId(staffUser);
    await as(db, user(owner), (tx) => tx.query("select public.remove_member($1)", [id]), {
      commit: true,
    });
    const staff = await db.query<{ user_id: string | null }>(
      "select user_id from public.staff_members where id = $1",
      [staffProfileId],
    );
    expect(staff.rows[0]!.user_id).toBeNull();
  });

  it("lists members with emails only for member managers", async () => {
    const list = await as(db, user(owner), (tx) =>
      tx.query<{ email: string }>("select email from public.list_business_members($1)", [
        businessId,
      ]),
    );
    expect(list.rows.length).toBeGreaterThanOrEqual(2);
    const outsider = await createUser(db);
    await expect(
      as(db, user(outsider), (tx) =>
        tx.query("select * from public.list_business_members($1)", [businessId]),
      ),
    ).rejects.toThrow(/permission to view team/);
  });
});
