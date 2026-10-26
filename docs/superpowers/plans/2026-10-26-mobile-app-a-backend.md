# NORYX app — Plan A: client-side backend and website changes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the database and website everything the NORYX app's client side needs: one connection code per salon, client links, client booking/cancelling/history, and account deletion.

**Architecture:** New Supabase migrations with RLS and SECURITY DEFINER functions (`set search_path = ''`), tested in the existing PGlite harness (`tests/db/`). Client booking wraps the existing `create_online_booking` so every booking rule stays in one place. Website changes: the connection code in Settings, account deletion on the Account page, two copy fixes. Plans B (app shell + salon side) and C (app client side) follow and consume the RPCs defined here.

**Tech Stack:** Postgres/Supabase migrations, Vitest + PGlite, Next.js 16 server actions/route handlers, Zod, existing i18n dictionaries.

**Spec:** `docs/superpowers/specs/2026-10-26-mobile-app-design.md` (approved 2026-10-26)

## Global Constraints

- Every new table: `business_id` where it belongs to a salon, RLS enabled, explicit grants, composite FKs `(business_id, x_id)`, tests in `tests/db/` (CLAUDE.md).
- SECURITY DEFINER functions use `set search_path = ''`, schema-qualify everything, and revoke execute from `public, anon` (and `authenticated` for internal helpers) — Supabase default privileges grant it otherwise.
- One active connection code per salon; the client chooses the professional when booking (owner decision).
- Linking requires a confirmed email (`auth.users.email_confirmed_at is not null`).
- A client sees only appointments with `created_at >= client_links.linked_at`.
- Unlinking sets `unlinked_at`; it never deletes salon data or cancels appointments; history and cancelling upcoming appointments stay available.
- Account deletion removes the auth user and client links; salons keep `customers` rows with `user_id` cleared.
- Unknown and inactive codes give the same error (`connection_code_invalid`); never reveal whether a code exists.
- Copy in en/nl/fr; nl and fr typed as `typeof en` (dictionaries test enforces shape).
- Money is integer cents; never claim an email/payment happened (`src/lib/notifications.ts`).
- The live hosted project `abizqbkvnoatwgpsgduz` is the target; migrations must be additive so the website keeps working.

## Review Focus

- A client links salon X, then calls `my_appointments` — visits salon X recorded *before* the link (same email) must not appear. → Task 3 test `hides visits from before the link`.
- Someone guesses codes in a loop — after 10 failed attempts in 15 minutes the function refuses even valid codes for that user. → Task 2 test `limits code attempts per user`.
- A client books at a salon they have unlinked — must be refused (`client_link_required`), while cancelling an existing upcoming appointment there still works. → Task 3 tests.
- Salon on Basic at 250 customers; a new client links — `plan_limit_customers` error, no link row created. → Task 2 test.
- An account that is also a salon's only owner deletes itself — refused with a clear error, nothing deleted. → Task 4 test.

---

### Task 0: Bring the hosted database up to date

**Files:** none (environment).

- [ ] **Step 1:** Dry run: `npx supabase@latest db push --dry-run --db-url "$DB_URL"` (pooler `aws-0-eu-west-1.pooler.supabase.com:5432`, user `postgres.abizqbkvnoatwgpsgduz`; password from the owner, never written to files). Expected: exactly the 7 migrations `20261023120000` … `20261024100000`.
- [ ] **Step 2:** Apply: same command without `--dry-run`. Expected: `Finished supabase db push`.
- [ ] **Step 3:** Verify the website still serves `/`, `/atelier-noor`, `/login` with HTTP 200 on the local dev server, then `npx supabase gen types typescript --db-url "$DB_URL" --schema public > src/types/database.ts && npx prettier --write src/types/database.ts`; `npm run check` passes.

### Task 1: Test harness knows confirmed emails

**Files:**
- Modify: `tests/db/supabase-shim.sql` (auth.users)
- Modify: `tests/db/harness.ts` (`createUser`)

**Interfaces:**
- Produces: `createUser(db, fullName?, { confirmed?: boolean } = {})` — confirmed defaults to `true` so existing tests keep their meaning.

- [ ] **Step 1:** Add `email_confirmed_at timestamptz` to `auth.users` in the shim; `createUser` sets it to `now()` unless `confirmed: false`.
- [ ] **Step 2:** `npx vitest run tests/db` — all existing tests still pass.
- [ ] **Step 3:** Commit `test: model confirmed emails in the auth shim`.

### Task 2: Connection codes and client links

**Files:**
- Create: `supabase/migrations/20261026090000_client_links.sql`
- Create: `tests/db/client-links.test.ts`
- Modify: `src/app/app/settings/page.tsx`, `src/app/app/settings/forms.tsx`, `src/app/app/settings/actions.ts` (show/regenerate code)
- Modify: `src/i18n/dictionaries/{en,nl,fr}/settings.ts` (section `connectionCode`)

**Interfaces:**
- Produces (SQL):
  - table `business_connection_codes(id, business_id, code text unique, active boolean, created_by, created_at)`; partial unique index one active per business. Code format `^[A-Z]{3,4}-[0-9]{4}$`: up to 4 letters from the slug (A–Z only, padded with `X`) + `-` + 4 random digits.
  - `ensure_connection_code(p_business_id uuid) returns text` — authenticated, any active member; returns the active code, creating one if none.
  - `regenerate_connection_code(p_business_id uuid) returns text` — `settings.manage`; deactivates the old code, returns a new one; audited (`connection_code.regenerated`).
  - type `client_category` enum `('hair','nails','beauty','brows','lashes','other')`.
  - table `client_links(id, user_id → auth.users on delete cascade, business_id, customer_id, categories client_category[] not null check (cardinality ≥ 1), linked_at, unlinked_at, unique (user_id, business_id), FK (business_id, customer_id) → customers)`; RLS select own rows only; no direct writes.
  - table `connection_code_attempts(user_id, attempted_at)` (internal, for rate limiting).
  - `link_business_by_code(p_code text, p_categories client_category[]) returns jsonb` → `{ business_id, slug, name, categories }`. Errors: `email_not_confirmed`, `connection_code_invalid`, `too_many_attempts`, `plan_limit_customers`.
  - `unlink_business(p_business_id uuid) returns void`.
  - `my_client_links() returns setof jsonb` (`business_id, slug, name, logo_path, categories, linked_at, unlinked_at`).
- Produces (TS): `ConnectionCodeCard` in settings forms; action `regenerateConnectionCode(formData)`.

- [ ] **Step 1: Write the failing tests** in `tests/db/client-links.test.ts`:
  - `gives every salon one active, readable code` — `ensure_connection_code` twice returns the same value matching `/^[A-Z]{3,4}-\d{4}$/`.
  - `regenerating invalidates the old code but keeps existing links` — link with old code, regenerate, linking with the old code → `connection_code_invalid`, existing link still returned by `my_client_links`.
  - `requires a confirmed email` — user created with `{ confirmed: false }` → `email_not_confirmed`.
  - `links with the salon's own code and reuses an existing customer by email` — salon has a customers row with the user's email; after linking, `client_links.customer_id` is that row and `customers.user_id` is the user.
  - `gives unknown and inactive codes the same error` — both → `connection_code_invalid`.
  - `limits code attempts per user` — 10 wrong codes, then the correct one → `too_many_attempts`.
  - `respects the Basic customer limit` — Basic salon with 250 customers → `plan_limit_customers`, no `client_links` row.
  - `lets one salon serve several categories` — link with `{hair,nails}` → categories returned in that order.
  - `unlinks without touching salon data` — after `unlink_business`, `unlinked_at` set, customers row and appointments unchanged; re-linking clears `unlinked_at` and keeps `linked_at`.
  - `keeps links private` — another user selecting `client_links` sees 0 rows; anon can't execute `link_business_by_code`.
- [ ] **Step 2:** `npx vitest run tests/db/client-links.test.ts` — FAIL (functions don't exist).
- [ ] **Step 3:** Write the migration. Attempts: count rows for `auth.uid()` in the last 15 minutes before validating; insert a row on every failure. Customer creation: insert into `customers` with first/last name from `profiles.full_name` (split on first space; first name fallback = email local part), email, `source 'manual'`, `on conflict (business_id, lower(email))` reuse and set `user_id`; the existing customer-limit trigger raises `plan_limit_customers`.
- [ ] **Step 4:** Tests pass; `npx vitest run tests/db` all green.
- [ ] **Step 5:** Settings UI: a card "Connection code for the NORYX app" showing the code (copy button), text "Clients enter this code in the NORYX app to connect to your salon." and, for `settings.manage`, a confirm-dialog "New code" (old code stops working; connected clients stay connected). Keys in `settings.connectionCode.{title,text,copy,regenerate,regenerateTitle,regenerateText,regenerated}` (en/nl/fr).
- [ ] **Step 6:** `npm run check` passes; commit `feat: connection codes and client links`.

### Task 3: Client appointments, booking and cancelling

**Files:**
- Create: `supabase/migrations/20261026091000_client_bookings.sql`
- Create: `tests/db/client-bookings.test.ts`

**Interfaces:**
- Consumes: `client_links` (Task 2), `create_online_booking` (existing, unchanged).
- Produces:
  - `my_appointments() returns setof jsonb` → `appointment_id, business_id, business_name, business_slug, linked (bool: unlinked_at is null), service_name, staff_name, starts_at, ends_at, price_cents, currency, locale, status, can_cancel`; only rows with `created_at >= linked_at`, ordered by `starts_at desc`.
  - `client_book_appointment(p_business_id uuid, p_service_id uuid, p_staff_id uuid, p_starts_at timestamptz, p_note text default null) returns jsonb` — same shape as `create_online_booking`'s result. Requires an active link (`client_link_required`); max 6 bookings per user per hour (`too_many_bookings`); uses the linked customer's name/email/phone and the salon's first active location; calls `create_online_booking`; then ensures the new appointment's `customer_id` is the linked customer.
  - `client_cancel_appointment(p_appointment_id uuid, p_reason text default null) returns void` — own appointments only (via linked customer rows, active or unlinked), same deadline and status rules and notification as `cancel_booking_by_token`. Errors `booking_not_found`, `booking_not_cancellable`, `cancellation_deadline_passed`.
- [ ] **Step 1: Write the failing tests:**
  - `books with the salon's own rules for a linked client` — success returns `status` and the appointment appears in `my_appointments` with `linked = true`.
  - `refuses booking without an active link` — unlinked salon → `client_link_required`.
  - `applies the existing booking rules` — slot outside working hours → `slot_unavailable` (proves the wrapper reuses `create_online_booking`).
  - `hides visits from before the link` — appointment created for the same email before `linked_at` is absent.
  - `shows history and allows cancelling after unlinking` — after unlink, the upcoming appointment is returned with `linked = false` and `client_cancel_appointment` succeeds.
  - `enforces the cancellation deadline` — within the notice period → `cancellation_deadline_passed`.
  - `never shows or cancels someone else's appointments` — other user: `my_appointments` empty, cancel → `booking_not_found`.
  - `limits bookings per hour` — 7th booking within an hour → `too_many_bookings`.
- [ ] **Step 2:** Run; FAIL.
- [ ] **Step 3:** Write the migration; grant the three functions to `authenticated` only.
- [ ] **Step 4:** Run; PASS; `npx vitest run tests/db` green.
- [ ] **Step 5:** Commit `feat: client booking, cancelling and history`.

### Task 4: Account deletion (app and website)

**Files:**
- Create: `supabase/migrations/20261026092000_account_deletion.sql`
- Create: `tests/db/account-deletion.test.ts`
- Create: `src/app/api/account/delete/route.ts`
- Modify: `src/app/app/account/{page.tsx,forms.tsx,actions.ts}`
- Modify: `src/i18n/dictionaries/{en,nl,fr}/account.ts` (keys `delete.{title,text,confirm,ownerBlocked,done}`)

**Interfaces:**
- Produces:
  - `prepare_account_deletion() returns void` (authenticated): raises `account_owns_business` if the caller is the only active owner of any business; otherwise clears `customers.user_id` for the caller and deletes the caller's `client_links` and memberships.
  - `POST /api/account/delete` — auth via `Authorization: Bearer <access token>` (app) or the session cookie (website); calls `prepare_account_deletion` as the user, then `auth.admin.deleteUser` with the service role; returns `{ ok: true }` or `{ ok: false, error }` with status 400/401/500. Plan B's app calls this route.
  - Server action `deleteAccount(_prev, formData)` for the website, calling the same logic; signs out and redirects to `/`.
- [ ] **Step 1: Write the failing tests:** `refuses while the user is a business's only owner`; `detaches customer records and removes links` (customers row kept, `user_id` null, no `client_links`).
- [ ] **Step 2:** Run; FAIL. **Step 3:** Migration. **Step 4:** PASS.
- [ ] **Step 5:** Route handler + website "Delete account" card with a typed confirmation ("DELETE"/"VERWIJDEREN"/"SUPPRIMER" per language) and the owner-blocked message.
- [ ] **Step 6:** Manual check on localhost with a throwaway account: deletion succeeds, sign-in afterwards fails with the wrong-credentials message. `npm run check` passes. Commit `feat: delete account`.

### Task 5: Copy, privacy sentence, docs and hosted rollout

**Files:**
- Modify: `src/i18n/dictionaries/{en,nl,fr}/app-showcase.ts` (`diagramCaption`: "Each salon will get a code of their own …" — salon, not professional)
- Modify: the privacy policy dictionary/page added on main (find with `grep -rn "privacy" src/i18n/dictionaries/en`) — one sentence: client accounts store name, email and the salons you link; deleting the account removes it, salons keep their own client records. Mark "legal review pending" in `docs/ROADMAP.md`.
- Modify: `docs/ARCHITECTURE.md` (client links, codes, privacy rule, deletion), `docs/ROADMAP.md`.

- [ ] **Step 1:** Copy changes; `npx vitest run src/i18n` passes.
- [ ] **Step 2:** Apply the three new migrations to the hosted project (dry run, then push), regenerate `src/types/database.ts`, run `npm run check`.
- [ ] **Step 3:** Create the demo code: as the demo owner, `select public.ensure_connection_code('<Atelier Noor id>')`; note the code in the report (not in the repo).
- [ ] **Step 4:** On localhost, Settings shows the code for `owner@noryx.test`; `/apps` shows the corrected caption.
- [ ] **Step 5:** Commit `docs: client accounts in architecture, roadmap and privacy`.

---

**Next plans:** B — Expo app shell, auth, side switching and the salon side (Today, Calendar + appointment actions, Clients, Clock, More); C — client side (onboarding with codes, salon tabs, booking, Afspraken, linked-salon management, account deletion). Each is written after the previous one is merged, against the then-current code.
