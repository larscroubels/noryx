import { readFile } from "node:fs/promises";

import { expect, it } from "vitest";

import { createTestDatabase, createUser } from "./harness";

it("creates missing profiles for accounts that existed before the migrations", async () => {
  const db = await createTestDatabase();
  const id = await createUser(db, "Early Bird");
  await db.query("delete from public.profiles where id = $1", [id]);
  const backfill = await readFile("supabase/migrations/20261024100000_backfill_profiles.sql", "utf8");
  await db.exec(backfill);
  await db.exec(backfill); // safe to run twice
  const { rows } = await db.query<{ full_name: string }>("select full_name from public.profiles where id = $1", [id]);
  expect(rows).toEqual([{ full_name: "Early Bird" }]);
});
