# NORYX App — Plan B: app shell, sign-in and salon side

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A NORYX app for iOS and Android (Expo) where salon owners and team members sign in and do their daily work: Today, Calendar with appointment actions, Clients, Clock and More, plus the shared profile with language, side switching, sign-out and account deletion.

**Architecture:** A new Expo Router app in `mobile/` talks straight to the same Supabase project with the user's own session; RLS and database functions keep every rule in the database. Pure TypeScript from `src/` (time, format, availability, status rules, navigation, time clock, dictionaries) is imported through the `@/` alias, so web and app share logic. The two server-only needs get small routes in the website: `POST /api/account/delete` (plan A) and `POST /api/app/web-link` (this plan, signs the user into "More" web pages).

**Tech Stack:** Expo SDK 58 (current when written; use what `create-expo-app@latest` installs), Expo Router, TypeScript, `@supabase/supabase-js`, `expo-secure-store`, `@tanstack/react-query` 5, `lucide-react-native`, `react-native-svg`, `expo-font` (Cormorant Garamond, Manrope), `expo-web-browser`, `expo-haptics`, `expo-localization`; tests with `jest-expo` + `@testing-library/react-native` in `mobile/`, Vitest + PGlite at the root.

**Spec:** `docs/superpowers/specs/2026-10-26-mobile-app-design.md` (sections 2, 3, 5.1, 5.2, 5.4, 5.5 shared + salon, 5.6, 6). Plan A (merged) delivered the client backend and account deletion.

## Global Constraints

- Authorisation lives in the database; the app never re-implements a permission rule as the only guard. Hiding a button by permission is UX, the DB is the gate.
- No service-role key in the app. Only `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SITE_URL` (from `mobile/.env`, git-ignored; `mobile/.env.example` committed).
- Money is integer cents; times are UTC instants, local dates `YYYY-MM-DD`, minutes after midnight; use `@/lib/time` and `@/lib/format`. Format with the salon's locale.
- Design tokens from `src/styles/tokens.css` only; pink-700 `#b83d5d` for primary actions; rose gold and pink ≤ 400 decorative only; status never by colour alone (label + icon).
- Every screen has loading (skeleton), empty (one next step), error (what to do + retry) and success states. Touch targets ≥ 44 pt, accessible labels, works at the largest text size.
- NL/FR/EN. Salon side uses the salon's `locale`; the user can override it in Profile.
- Never claim an email, payment or integration happened unless it did ("Payment recorded" means recorded in NORYX, not charged).
- Root `npm run check` must keep passing and must not lint/typecheck `mobile/`; `mobile/` has its own `npm run check` (lint + typecheck + jest).
- Don't commit `package-lock.json` changes at the root unless a task adds a root dependency (none does). `mobile/package-lock.json` is committed.

## Review Focus

- The session expires or is revoked while the app is open → the next request fails with 401: the app signs out to the sign-in screen with a message, never hangs on a spinner. → Task 3 test `signs out when the refresh token is rejected`.
- A staff member (not manager) opens Calendar → sees only their own appointments and can't pick other professionals; actions on someone else's appointment are refused by RLS and shown as an error. → Task 6 test `staff see only themselves in the picker`, Task 7 test `shows the database refusal`.
- A salon in another time zone or a day with a DST change → "today" and the week columns are the salon's local days, not the phone's. → Task 6 test `uses the salon's days across a DST change`.
- A search term with `,`, `(`, `)` or `%` in Clients → no PostgREST syntax error, literal match. → Task 8 test `escapes PostgREST filter characters`.
- The "More" link request with a hostile `next` (`//evil.com`, `https://…`, `/login`) → refused; only `/app` paths. → Task 10 test `only allows workspace paths`.

---

### Task 0: Expo project, shared code and tool isolation

**Files:**
- Create: `mobile/` via `npx create-expo-app@latest mobile --template tabs` then remove the template's example screens/components
- Create: `mobile/metro.config.js`, `mobile/tsconfig.json` (paths), `mobile/jest.config.js`, `mobile/.env.example`, `mobile/src/shared.test.ts`
- Modify: root `tsconfig.json` (`exclude`: add `"mobile"`), root `eslint.config.mjs` (`globalIgnores` add `"mobile/**"`), `.gitignore` (`mobile/.env`, `mobile/.expo/`), `CLAUDE.md` (commands: `npm --prefix mobile run check`, `npm --prefix mobile start`)

**Interfaces:**
- Produces: alias `@/*` → `../src/*` (shared web code) and `~/*` → `./src/*` (app code), working in Metro, TypeScript and Jest. App code lives in `mobile/src/`, routes in `mobile/app/`.
- Produces: `mobile/package.json` scripts `start`, `test` (`jest`), `typecheck` (`tsc --noEmit`), `lint` (`expo lint`), `check` (all three).

- [ ] **Step 1: Write the failing test** `mobile/src/shared.test.ts`:
```ts
import { zonedTimeToUtc } from "@/lib/time";
import { NEXT_STATUSES } from "@/lib/appointments/status";
import { dictionaries } from "@/i18n/dictionaries";
it("imports shared web code", () => {
  expect(zonedTimeToUtc("2026-10-25", 600, "Europe/Brussels").toISOString()).toBe("2026-10-25T09:00:00.000Z");
  expect(NEXT_STATUSES.pending).toEqual(["confirmed", "cancelled"]);
  expect(dictionaries.fr.common).toBeDefined();
});
```
- [ ] **Step 2:** `npm --prefix mobile test` → FAIL (cannot resolve `@/lib/time`).
- [ ] **Step 3:** Configure: Metro `watchFolders: [path.resolve(__dirname, "../src")]`, `resolver.nodeModulesPaths: [path.resolve(__dirname, "node_modules")]` (shared files resolve packages such as `zod` from `mobile/node_modules`; add any they import, e.g. `zod`, to `mobile/package.json`), `resolver.extraNodeModules`/tsconfig paths for `@` and `~`; Jest `moduleNameMapper` for both aliases. The app never imports shared files that pull in `server-only` or `next/*` (e.g. `@/lib/supabase/server`, `@/lib/auth/session`).
- [ ] **Step 4:** `npm --prefix mobile test` → PASS; `npm --prefix mobile run check` → PASS; root `npm run check` → PASS (mobile excluded).
- [ ] **Step 5:** `npm --prefix mobile start` and open in Expo Go on a phone: the empty app loads without a red screen.
- [ ] **Step 6: Commit** `chore: Expo app with shared NORYX code`

### Task 1: Theme, fonts and UI primitives

**Files:**
- Create: `mobile/src/theme/tokens.ts`, `mobile/src/theme/tokens.test.ts`, `mobile/src/theme/fonts.ts`
- Create: `mobile/src/ui/{Text,Button,Card,Field,Badge,Screen,EmptyState,ErrorState,Skeleton,Sheet,Symbol}.tsx`, `mobile/src/ui/ui.test.tsx`
- Modify: `mobile/app.json` (name "NORYX", scheme `noryx`, `ios.bundleIdentifier` / `android.package` `be.noryx.app`, icon and splash from the brand assets in `public/` (find the app icon the website ships), ivory splash background)

**Interfaces:**
- Produces: `colors` (token name → hex, e.g. `colors["pink-700"] === "#b83d5d"`, plus semantic `canvas`, `surface`, `fg`, `fgMuted`, `border`, `primary`, `primaryFg`, `danger`, `success`, `warning`), `radius` (`card: 24`, `pill: 999`), `space` (4-pt scale).
- Produces: `<Text variant="display" | "title" | "body" | "label" | "caption">` (Cormorant for display/title, Manrope otherwise, `allowFontScaling` on); `<Button variant="primary" | "secondary" | "danger" | "ghost" loading? onPress haptic?>` (pill, min height 44, `accessibilityState={{ busy, disabled }}`, light haptic on press when `haptic`); `<Badge tone label icon>` (always renders the label); `<Screen title? scroll? refreshing? onRefresh?>`; `<EmptyState title text action?>` with the NORYX symbol; `<ErrorState message onRetry>`; `<Skeleton lines>` (static when Reduce Motion is on, via `AccessibilityInfo.isReduceMotionEnabled`); `<Sheet visible onClose title>` (bottom sheet modal); `<Field label error hint>` wrapping `TextInput`.

- [ ] **Step 1: Write the failing tests:** `tokens.test.ts` — `matches tokens.css` reads `../src/styles/tokens.css` (fs) and asserts every hex in `colors` that has a CSS variable of the same name equals the CSS value; `ui.test.tsx` — `Button shows busy and ignores presses while loading`, `Badge always shows its label`, `ErrorState calls onRetry`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; load fonts in the root layout behind the splash screen. **Step 4:** Run → PASS.
- [ ] **Step 5: Commit** `feat(app): theme and UI primitives`

### Task 2: App strings and language

**Files:**
- Create: `mobile/src/i18n/{en,nl,fr}.ts` (app-only strings, `nl`/`fr` typed `typeof en`), `mobile/src/i18n/index.tsx`, `mobile/src/i18n/i18n.test.ts`

**Interfaces:**
- Produces: `type AppLocale = "nl" | "fr" | "en"`; `resolveLocale(tag: string | null | undefined): AppLocale` (first two letters, unknown → `"nl"`, the website's `DEFAULT_LOCALE`); `<I18nProvider>` and `useT(): { t: Dictionary; app: typeof en; locale: AppLocale; setOverride(l: AppLocale | null): void }` where `t` is the website dictionary for the locale (`@/i18n/dictionaries`) and `app` the app-only strings. Effective locale = override (stored with SecureStore key `noryx.locale`) ?? salon locale (set by Task 4 on the salon side) ?? device locale (`expo-localization`).
- App-only strings are only those the website lacks (tab names, "Switch to client side", empty states of app screens, …). Status labels, auth messages and validation come from `t`.

- [ ] **Step 1: Write the failing tests:** `same keys in every language` (recursive key sets of en/nl/fr equal); `resolves locale tags` (`"fr-BE"`→`fr`, `"en-US"`→`en`, `"de-DE"`→`nl`, `undefined`→`nl`).
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): languages`

### Task 3: Supabase session and sign-in screens

**Files:**
- Create: `mobile/src/lib/supabase.ts`, `mobile/src/lib/secure-storage.ts`, `mobile/src/lib/secure-storage.test.ts`, `mobile/src/lib/auth-errors.ts`, `mobile/src/lib/auth-errors.test.ts`, `mobile/src/lib/session.tsx`, `mobile/src/lib/session.test.tsx`
- Create: `mobile/app/(auth)/_layout.tsx`, `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`

**Interfaces:**
- Produces: `supabase` (typed `SupabaseClient<Database>` from `@/types/database`, `auth.storage = secureStorage`, `persistSession`, `autoRefreshToken`, `detectSessionInUrl: false`; `startAutoRefresh`/`stopAutoRefresh` on `AppState` changes).
- Produces: `secureStorage: { getItem, setItem, removeItem }` storing values in SecureStore chunks of ≤ 1800 bytes (`key`, `key.1`, … plus `key.count`), because sessions exceed SecureStore's per-value limit.
- Produces: `authErrorMessage(error: { code?: string } | null, t: Dictionary): string` mapping Supabase codes to the website's `t.auth.messages` (`invalid_credentials`, `email_not_confirmed`, `over_request_rate_limit`, `user_already_exists`, `weak_password`; anything else → the generic sign-in failure message). Read `src/app/(auth)/actions.ts` for the exact mapping the website uses and mirror it.
- Produces: `<SessionProvider>` and `useSession(): { status: "loading" | "signedOut" | "signedIn"; session; signOut(message?: string): Promise<void> }`; on `TOKEN_REFRESHED` failure / `SIGNED_OUT` it clears the query cache and routes to `/(auth)/sign-in` with the message.
- Sign-up uses `passwordField(t)` from `@/lib/validation/auth`, full name and email; `emailRedirectTo: ${EXPO_PUBLIC_SITE_URL}/auth/confirm?next=/apps`. After sign-up: "Check your inbox to confirm your email" (the website's copy). Forgot password: `resetPasswordForEmail(email, { redirectTo: ${SITE}/auth/confirm?next=/reset-password })` (reset happens on the website).

- [ ] **Step 1: Write the failing tests:** `secure-storage` — `round-trips a 5 KB value in chunks`, `removeItem deletes every chunk` (mock `expo-secure-store` with a Map); `auth-errors` — one case per mapped code plus unknown; `session` — `signs out when the refresh token is rejected` (emit `SIGNED_OUT` from a mocked client → status `signedOut`, router replaced to sign-in).
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** On a phone: sign in as `owner@noryx.test` (hosted demo) works; wrong password shows the website's message.
- [ ] **Step 6: Commit** `feat(app): sign-in, sign-up and session`

### Task 4: Account, side choice and workspace

**Files:**
- Create: `mobile/src/lib/account.ts`, `mobile/src/lib/side.ts`, `mobile/src/lib/side.test.ts`, `mobile/src/lib/workspace.tsx`
- Create: `mobile/app/_layout.tsx` (providers + redirect), `mobile/app/pick-side.tsx`, `mobile/app/(salon)/_layout.tsx` (tabs Today · Calendar · Clients · Clock · More), `mobile/app/(client)/_layout.tsx` + `mobile/app/(client)/index.tsx`

**Interfaces:**
- Produces: `loadAccount(): Promise<{ memberships: { role: MemberRole; business: { id; slug; name; status; locale; timezone } }[]; links: unknown[] }>` — memberships exactly like `getMemberships()` in `src/lib/auth/session.ts` (active only, ordered by `created_at`), links via `rpc("my_client_links")` filtered to `unlinked_at === null`.
- Produces: `chooseSide(input: { memberships: number; links: number; lastSide: "salon" | "client" | null }): "salon" | "client" | "pick"` — memberships only → salon; links only or neither → client; both → `lastSide` or `"pick"`. Last side stored in SecureStore `noryx.side`.
- Produces: `<WorkspaceProvider>` / `useWorkspace(): { business: Tables<"businesses">; role; permissions: ReadonlySet<Permission>; staffId: string | null; can(p: Permission | Permission[]): boolean; switchBusiness(id) }` — same three queries as `requireWorkspace()` (`businesses` row, `rpc("my_business_permissions")`, own `staff_members.id`), active business id stored in SecureStore `noryx.business`, re-validated against memberships; sets the i18n salon locale.
- `(client)/index.tsx` in this plan: an honest screen "The client side arrives in the next update" with a link to Profile and "Run a salon? Set it up on noryx…" opening `${SITE}/signup` (spec 5.2; plan C replaces the rest). No fake data.

- [ ] **Step 1: Write the failing test** `side.test.ts`: `salon only`, `client only`, `neither → client`, `both uses last side`, `both without last side → pick`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** On a phone: the demo owner lands on Today's tab; a fresh account lands on the client screen.
- [ ] **Step 6: Commit** `feat(app): side choice and workspace`

### Task 5: Profile (shared)

**Files:**
- Create: `mobile/app/profile.tsx` (stack screen, reachable from both sides' headers), `mobile/app/delete-account.tsx`, `mobile/src/lib/delete-account.ts`, `mobile/src/lib/delete-account.test.ts`

**Interfaces:**
- Consumes: `POST ${SITE}/api/account/delete` (plan A: bearer token; `200 {ok:true}`, `400 {ok:false,error:"account_owns_business"}`, `401`, `500`).
- Produces: `requestAccountDeletion(accessToken: string, fetchImpl = fetch): Promise<"deleted" | "owns_business" | "failed">`.
- Profile shows: name and email, language (NL/FR/EN + "salon language"), switch side (only when both apply), business switcher (only with several memberships), sign out, delete account. Delete screen: the website's `t.account.delete` copy, typed confirmation word `t.account.delete.confirmWord`, then `requestAccountDeletion`; `deleted` → sign out to sign-in with a confirmation; `owns_business` → `t.account.delete.ownerBlocked`.

- [ ] **Step 1: Write the failing test** `delete-account.test.ts`: `maps 200 to deleted`, `maps account_owns_business to owns_business`, `maps 401, 500 and network errors to failed`, `sends the bearer token` (mock fetch).
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): profile and account deletion`

### Task 6: Shared logic moves, Today and Calendar

**Files:**
- Create: `src/lib/setup-checklist.ts` + `src/lib/setup-checklist.test.ts` (moved from `src/app/app/page.tsx:120-142`); Modify: `src/app/app/page.tsx` to use it
- Create: `mobile/src/lib/days.ts`, `mobile/src/lib/days.test.ts`, `mobile/src/lib/appointments.ts` (queries)
- Create: `mobile/app/(salon)/index.tsx` (Today), `mobile/app/(salon)/calendar.tsx`, `mobile/src/salon/AppointmentRow.tsx`, `mobile/src/salon/StaffPicker.tsx`, `mobile/src/salon/StaffPicker.test.tsx`

**Interfaces:**
- Produces: `buildSetupChecklist(counts: { hours: number; services: number; staff: number; bookingEnabled: boolean }): { key: "hours" | "services" | "staff" | "publish"; done: boolean }[]` — same items and done-rules as the web dashboard today; web page and app both use it.
- Produces: `dayRange(date: string, timeZone: string): { from: string; to: string }` (UTC ISO bounds of a local day via `zonedTimeToUtc`), `weekDays(date: string): string[]` (ISO week Monday→Sunday), `localDate(instant: string, timeZone: string): string`, `groupByLocalDay<T extends { starts_at: string }>(rows: T[], timeZone: string): Map<string, T[]>`.
- Produces: `listAppointments({ businessId, from, to, staffId? })` selecting `id, starts_at, ends_at, status, service_name, staff_id, price_cents, currency, customer:customers(id, first_name, last_name)` ordered by `starts_at`; RLS limits staff to their own.
- Today: greeting, today's appointments (salon's local day), bookings waiting for approval (`status = 'pending'`, from now on) with Confirm/Decline shortcuts, setup checklist when `can("settings.manage")` and not all done (items open the web page via Task 10's `openWorkspacePage`), clock shortcut when the user has a staff profile.
- Calendar: segmented Day / Week; date stepper and "Today"; `StaffPicker` lists bookable staff when `can(["appointments.view_all", "appointments.manage_all"])` and only the user's own profile otherwise; day = list of rows by time (status badge with label), week = 7 sections; pull to refresh; tap → appointment detail (Task 7).

- [ ] **Step 1: Write the failing tests:** `setup-checklist.test.ts` (Vitest) — `all done when counts and booking are set`, `publish needs booking enabled`; `days.test.ts` — `uses the salon's days across a DST change` (`dayRange("2026-10-25","Europe/Brussels")` spans 25 h: `from 2026-10-24T22:00:00.000Z`, `to 2026-10-25T23:00:00.000Z`), `week starts on Monday`, `groups by the salon's day, not the phone's` (an instant at 23:30 UTC lands on the next Brussels day); `StaffPicker.test.tsx` — `staff see only themselves in the picker`.
- [ ] **Step 2–4:** FAIL → implement → PASS (root `npm run check` too: the dashboard still renders the same checklist).
- [ ] **Step 5: Commit** `feat(app): Today and Calendar`

### Task 7: Appointment detail and actions

**Files:**
- Create: `supabase/migrations/20261027090000_reschedule_appointment.sql`, `tests/db/reschedule.test.ts`
- Modify: `src/app/app/appointments/actions.ts` (`rescheduleAppointment` calls the RPC)
- Create: `mobile/app/(salon)/appointment/[id].tsx`, `mobile/src/salon/{StatusActions,CancelSheet,RescheduleSheet,PaymentSheet,GiftCardSheet}.tsx`, `mobile/src/salon/actions.ts`, `mobile/src/salon/actions.test.ts`

**Interfaces:**
- Produces: `reschedule_appointment(p_appointment_id uuid, p_staff_id uuid, p_starts_at timestamptz) returns void` (SECURITY INVOKER is enough — RLS and triggers already guard the update; keep the buffer `blocked_until - ends_at`, recompute `ends_at` from `duration_minutes`; overlap → the exclusion constraint's `23P01`; cancelled → existing trigger error). Granted to `authenticated` only. The web action keeps its validation and messages and calls this RPC instead of computing times itself.
- Produces (app): `changeStatus(id, status)`, `cancelByBusiness(id, reason)` (`status = 'cancelled'`, `cancelled_by = 'business'`), `reschedule(id, staffId, startsAt)`, `recordPayment({ appointmentId, amountCents, method, note })` (insert into `payments` exactly like `src/app/app/finance/actions.ts` `recordPayment`), `redeemGiftCard({ businessId, code, amountCents, appointmentId })` (`rpc("redeem_gift_card")`), `saveInternalNote(id, note)` (trim, ≤ 2000, empty → null); each returns `{ ok: true } | { ok: false; message: string }` using `databaseErrorMessage` from `@/lib/actions` (pure: it imports only dictionaries and `@/lib/supabase/errors` → `@/lib/logger`), with `23P01` → `t.appointments.errors.overlap`.
- Screen: client name (tap → client detail), service, professional, time in the salon's zone, price, status badge, history (`appointment_events`); status buttons from `NEXT_STATUSES` (`@/lib/appointments/status`); cancel asks for confirmation + optional reason; reschedule sheet = date + professional + free times from `computeAvailability` (`@/lib/booking/availability`, same inputs as the web reschedule dialog, excluding this appointment's own busy period); payment sheet shown when `can(["finance.manage","appointments.manage_all"])`, methods and copy from `t.finance`; gift card sheet as on the web appointment page; internal note editor. Success haptic on confirm actions.

- [ ] **Step 1: Write the failing tests:** `tests/db/reschedule.test.ts` — `moves an appointment and keeps its buffer`, `refuses overlaps with 23P01`, `refuses cancelled appointments`, `staff can't move someone else's appointment` (0 rows / RLS error); `actions.test.ts` — `shows the database refusal` (mocked client error `42501` → `databaseErrorMessage` text), `maps overlap to the overlap message`, `empty note saves null`.
- [ ] **Step 2–4:** FAIL → implement → PASS; apply the migration to the hosted project and run `npm run db:types` equivalent (`npx supabase@latest gen types typescript --db-url … --schema public > src/types/database.ts`).
- [ ] **Step 5:** On a phone as the demo owner: confirm a pending appointment, reschedule one, record a cash payment; the web calendar shows the same.
- [ ] **Step 6: Commit** `feat: appointment actions in the app (reschedule via RPC)`

### Task 8: Clients

**Files:**
- Create: `mobile/src/lib/customer-search.ts`, `mobile/src/lib/customer-search.test.ts`, `mobile/app/(salon)/clients.tsx`, `mobile/app/(salon)/client/[id].tsx`

**Interfaces:**
- Produces: `customerSearchFilter(term: string): string | null` — PostgREST `or()` expression over `first_name, last_name, email, phone` with `ilike`, the term trimmed, `%`/`_`/`\` escaped for LIKE, and `,` `(` `)` `"` safely quoted (wrap each value in double quotes, escape inner `"` and `\`); empty → `null` (no filter). Read how `src/app/app/customers/page.tsx` searches and keep the same columns.
- List: search field (debounced 300 ms), 50 results ordered by name, empty state ("No clients yet" / "No matches"). Detail: name, contact buttons (`tel:` / `mailto:` via `Linking`, hidden when missing), upcoming and past visits (tap → appointment), notes list + add note when `can("customers.notes")`.

- [ ] **Step 1: Write the failing test:** `escapes PostgREST filter characters` (`'a,b'` → each `ilike` value is `"*a,b*"`-style quoted so the comma doesn't split; `'50%'` → `%` escaped), `empty term means no filter`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): clients`

### Task 9: Time clock

**Files:**
- Create: `mobile/app/(salon)/clock.tsx`, `mobile/src/salon/clock.ts`, `mobile/src/salon/clock.test.ts`

**Interfaces:**
- Consumes: `rpc("clock_in" | "clock_out", { p_business_id })`, own `time_entries` rows; `entryMinutes`, `weeklyTotals`, `weekDates`, `hoursAndMinutes` from `@/lib/time-clock`.
- Produces: `clockErrorMessage(error, t): string` mirroring `toggleClock` in `src/app/app/time/actions.ts` (`already_clocked_in`, `not_clocked_in`, `42501` → no profile, else `databaseErrorMessage`).
- Screen: big Clock in / Clock out button (state from the open entry), running time since clock-in, this week's entries and total; no staff profile → the website's `noProfile` message; hidden tab when the business lacks the time-clock feature is not required — the RPC refusal message is shown instead.

- [ ] **Step 1: Write the failing test:** `maps every clock error like the website`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** On a phone as `staff`-role demo user: clock in, clock out, the web time page shows the entry.
- [ ] **Step 6: Commit** `feat(app): time clock`

### Task 10: More — web pages signed in

**Files:**
- Create: `src/app/api/app/web-link/route.ts`, `src/lib/app-web-link.ts`, `src/lib/app-web-link.test.ts`
- Create: `mobile/app/(salon)/more.tsx`, `mobile/src/lib/open-workspace-page.ts`

**Interfaces:**
- Produces: `workspacePath(next: unknown): string | null` — accepts only strings starting with `/app` (exactly `/app` or `/app/…`), no `//`, no backslashes, no scheme; else `null`.
- Produces: `POST /api/app/web-link` — bearer token only (same pattern as `src/app/api/account/delete/route.ts`), body `{ next }`; `workspacePath` null → 400; generates a one-time link with `admin.auth.admin.generateLink({ type: "magiclink", email: user.email })` (sends no email) and returns `{ url: ${siteUrl}/auth/confirm?token_hash=<hashed_token>&type=magiclink&next=<path> }`. Rate-limited with `rateLimit` from `@/lib/rate-limit` (10 per minute per user).
- Produces (app): `openWorkspacePage(path: string): Promise<void>` — calls the route, opens the URL with `WebBrowser.openBrowserAsync`; on failure shows an error and offers opening `${SITE}${path}` without sign-in.
- More lists `visibleNav(permissions, features)` from `@/lib/navigation` minus the sections the app has natively (overview, calendar/appointments, customers, time), with the website's labels and icons; plus Help.

- [ ] **Step 1: Write the failing test** `only allows workspace paths` (`/app/finance` ✓, `/app` ✓, `/apps` ✗, `//evil.com` ✗, `https://evil.com` ✗, `/login` ✗, `/app\\..` ✗, `123` ✗).
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** Manual: POST without bearer → 401; with the demo owner's token and `next=/app/finance` → URL that opens the finance page signed in (check in a browser); `next=//evil.com` → 400.
- [ ] **Step 6: Commit** `feat: open workspace pages from the app signed in`

### Task 11: Store-ready config, test script and docs

**Files:**
- Create: `mobile/eas.json` (profiles `development` (dev client), `preview` (internal), `production`), `mobile/README.md` (setup, `.env`, Expo Go, EAS builds on Windows, manual test script)
- Modify: `docs/ARCHITECTURE.md` (app section: folder, shared code, session storage, web-link route), `docs/ROADMAP.md` (plan B done; open: plan C, store accounts)

- [ ] **Step 1:** Write the manual test script in `mobile/README.md` covering spec flows 1 (owner confirms an appointment), 2 (staff clocks in/out), 3 (owner sees the code — web), 8 (both sides switch — with a demo user that is staff and has a client link), plus: large text size, VoiceOver/TalkBack on Today, offline (error state with retry), dark mode stays on the light ivory theme.
- [ ] **Step 2:** `npx expo-doctor` in `mobile/` → no errors; `npm --prefix mobile run check` and root `npm run check` → PASS.
- [ ] **Step 3:** Run the manual script on the available phone; record results in the report.
- [ ] **Step 4: Commit** `docs: NORYX app setup, test script and architecture`
