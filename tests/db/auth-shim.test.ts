import { beforeAll, describe, expect, it } from "vitest";

import { createTestDatabase, createUser, type TestDatabase } from "./harness";

let db: TestDatabase;

beforeAll(async () => {
  db = await createTestDatabase();
});

describe("auth shim", () => {
  it("creates confirmed users by default and unconfirmed ones on request", async () => {
    const confirmed = await createUser(db, "Confirmed");
    const unconfirmed = await createUser(db, "Unconfirmed", { confirmed: false });
    const { rows } = await db.query<{ id: string; confirmed: boolean }>(
      "select id, email_confirmed_at is not null as confirmed from auth.users where id = any($1)",
      [[confirmed, unconfirmed]],
    );
    const byId = Object.fromEntries(rows.map((row) => [row.id, row.confirmed]));
    expect(byId[confirmed]).toBe(true);
    expect(byId[unconfirmed]).toBe(false);
  });
});
