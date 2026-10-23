import { beforeAll, describe, expect, it } from "vitest";

import { as, createTestDatabase, createUser, type TestDatabase } from "./harness";

let db: TestDatabase;
let admin: string;
let visitor: string;

const anon = { role: "anon" as const };
const user = (userId: string) => ({ role: "authenticated" as const, userId });
const submit = (email: string, message = "How do I invite my team?") =>
  as(
    db,
    anon,
    (tx) =>
      tx.query<{ id: string }>(
        "select public.submit_support_request('Visitor', $1, 'question', $2, 'nl') as id",
        [email, message],
      ),
    { commit: true },
  );

beforeAll(async () => {
  db = await createTestDatabase();
  admin = await createUser(db, "Admin");
  visitor = await createUser(db, "Visitor");
  await db.query("insert into public.platform_admins (user_id) values ($1)", [admin]);
});

describe("support requests", () => {
  it("lets anyone send a question, but not read any", async () => {
    const { rows } = await submit("visitor@example.test");
    expect(rows[0]!.id).toMatch(/^[0-9a-f-]{36}$/);
    await expect(as(db, anon, (tx) => tx.query("select * from public.support_requests"))).rejects.toThrow(
      /permission denied/,
    );
    const { rows: visible } = await as(db, user(visitor), (tx) => tx.query("select * from public.support_requests"));
    expect(visible).toEqual([]);
    await expect(
      as(db, user(visitor), (tx) =>
        tx.query("insert into public.support_requests (name, email, topic, message) values ('x', 'x@example.test', 'other', 'direct insert')"),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("validates the message and limits floods per address", async () => {
    await expect(submit("short@example.test", "hi")).rejects.toThrow(/check constraint/);
    await expect(submit("not-an-email")).rejects.toThrow(/check constraint/);
    for (let i = 0; i < 5; i++) await submit("flood@example.test");
    await expect(submit("FLOOD@example.test")).rejects.toThrow(/support_rate_limited/);
  });

  it("lets only platform admins read, close and delete requests", async () => {
    const { rows } = await submit("close-me@example.test");
    const id = rows[0]!.id;
    await expect(
      as(db, user(visitor), (tx) => tx.query("select public.admin_set_support_request_status($1, 'closed')", [id])),
    ).rejects.toThrow(/administrator/);

    const { rows: seen } = await as(db, user(admin), (tx) =>
      tx.query<{ email: string }>("select email from public.support_requests where id = $1", [id]),
    );
    expect(seen).toEqual([{ email: "close-me@example.test" }]);

    await as(db, user(admin), (tx) => tx.query("select public.admin_set_support_request_status($1, 'closed')", [id]), {
      commit: true,
    });
    const { rows: closed } = await db.query<{ status: string; closed_by: string }>(
      "select status, closed_by from public.support_requests where id = $1",
      [id],
    );
    expect(closed).toEqual([{ status: "closed", closed_by: admin }]);

    await as(db, user(admin), (tx) => tx.query("select public.admin_delete_support_request($1)", [id]), {
      commit: true,
    });
    const { rows: gone } = await db.query("select 1 from public.support_requests where id = $1", [id]);
    expect(gone).toEqual([]);
    const { rows: audit } = await db.query<{ action: string }>(
      "select action from public.audit_events where entity_id = $1 order by id",
      [id],
    );
    expect(audit.map((row) => row.action)).toEqual(["support_request.closed", "support_request.deleted"]);
  });
});

describe("schema version", () => {
  it("is readable by visitors and doesn't fail without a migration history", async () => {
    const { rows } = await as(db, anon, (tx) => tx.query<{ version: string | null }>("select public.schema_version() as version"));
    expect(rows).toHaveLength(1);
  });
});
