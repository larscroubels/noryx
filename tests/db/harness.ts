import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { PGlite, type Transaction } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const root = path.resolve(import.meta.dirname, "../..");

/** Boots an in-process Postgres with the Supabase shim and every migration applied. */
export async function createTestDatabase() {
  const db = new PGlite({ extensions: { btree_gist, pgcrypto } });
  await db.exec(await readFile(path.join(root, "tests/db/supabase-shim.sql"), "utf8"));

  const migrationsDir = path.join(root, "supabase/migrations");
  const migrations = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of migrations) {
    await db.exec(await readFile(path.join(migrationsDir, file), "utf8"));
  }
  return db;
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;

type Role = "anon" | "authenticated" | "service_role";

/**
 * Runs `fn` exactly like a PostgREST request: inside a transaction, as the given
 * database role, with the user's JWT claims set. The transaction is rolled back
 * unless `commit` is true, so tests stay independent.
 */
export async function as<T>(
  db: TestDatabase,
  identity: { role: Role; userId?: string },
  fn: (tx: Transaction) => Promise<T>,
  { commit = false }: { commit?: boolean } = {},
): Promise<T> {
  let result: T | undefined;
  const rollback = new Error("rollback");
  try {
    await db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: identity.userId ?? "", role: identity.role }),
      ]);
      await tx.exec(`set local role ${identity.role}`);
      result = await fn(tx);
      if (!commit) throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  return result as T;
}

let userCounter = 0;

/**
 * Creates an auth user (as the superuser, like Supabase Auth would). Users have a
 * confirmed email unless `confirmed: false` is passed.
 */
export async function createUser(
  db: TestDatabase,
  fullName = "Test User",
  { confirmed = true }: { confirmed?: boolean } = {},
) {
  userCounter += 1;
  const id = `00000000-0000-4000-8000-${String(userCounter).padStart(12, "0")}`;
  await db.query(
    "insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values ($1, $2, $3, $4)",
    [
      id,
      `user${userCounter}@example.test`,
      JSON.stringify({ full_name: fullName }),
      confirmed ? new Date() : null,
    ],
  );
  return id;
}

/** Creates a business through the public RPC, as the given user. */
export async function createBusiness(
  db: TestDatabase,
  userId: string,
  slug: string,
  name = "Studio Test",
) {
  return as(
    db,
    { role: "authenticated", userId },
    async (tx) => {
      const { rows } = await tx.query<{ id: string }>(
        "select public.create_business($1, $2, 'hair_salon') as id",
        [name, slug],
      );
      return rows[0]!.id;
    },
    { commit: true },
  );
}

/** Adds a member directly (invitations arrive in a later phase). */
export async function addMember(
  db: TestDatabase,
  businessId: string,
  userId: string,
  role: "owner" | "manager" | "staff",
  overrides: { granted?: string[]; revoked?: string[] } = {},
) {
  await db.query(
    `insert into public.business_members (business_id, user_id, role, granted_permissions, revoked_permissions)
     values ($1, $2, $3, $4, $5)`,
    [businessId, userId, role, overrides.granted ?? [], overrides.revoked ?? []],
  );
}
