# NORYX App — Plan C: the client side

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clients use the NORYX app to link their salons with each salon's code, book with a salon in a few taps, see and cancel their appointments, and manage their linked salons.

**Architecture:** The client side lives under `mobile/src/app/client/`. It calls the plan A database functions with the user's own session:
- `link_business_by_code`, `unlink_business`, `my_client_links`, `my_appointments`, `client_book_appointment`, `client_cancel_appointment`;
- the public catalogue, `get_public_business` and `get_public_busy_periods`.

Free times come from the same pure code as the website's booking page. That code is extracted from the server-only `src/lib/booking/public.ts` into shared modules, so the website and the app can't drift apart.

**Tech Stack:** as plan B: Expo SDK 58, Expo Router, react-query, `react-native-svg`. Tests use Jest + RNTL in `mobile/` and Vitest at the root.

**Spec:** `docs/superpowers/specs/2026-10-26-mobile-app-design.md`, sections 2.3, 5.3, 5.5 (client side), 6 and 7, flows 4–7, 9 and 10.

## Global Constraints

- Everything from plan B's Global Constraints still applies:
  - the database is the gate;
  - salon-local times;
  - integer cents;
  - design tokens only;
  - status never shown by colour alone;
  - NL/FR/EN;
  - no false claims.
- On the client side the language follows the phone, unless the user picks one in Profile. It does not follow the salon's language.
- Booking copy, steps and rules are the website's. Use the `t.booking` texts, including "you pay at the salon". Nothing mentions online payment.
- A client never sees salons they haven't linked. No browsing or search of salons.
- Unlinking never cancels anything. History and upcoming appointments stay under "Previous salons" and can still be cancelled within the salon's deadline.

## Review Focus

- **The same salon linked for a second service** (e.g. it serves hair and nails): the link keeps both categories. `link_business_by_code` replaces `categories`, so the app sends the union. → Task 2 test `keeps earlier categories when a salon is linked again`.
- **Replacing salon A with B where B's code is wrong:** A stays linked, and the error is shown. → Task 7 test `keeps the old salon when the new code fails`.
- **The chosen time is taken by someone else before confirming:** the app shows the website's `slot_unavailable` message, goes back to the time step and reloads the times. → Task 5 test `returns to times when the slot was taken`.
- **The salon's time zone differs from the phone's:** dates, slot labels and "today" use the salon's zone. → Task 0 test `labels slots in the salon's time zone`.
- **Unconfirmed email:** linking shows the website's "confirm your email first" text with a resend button, and never pretends a salon was linked. → Task 3 test `asks to confirm the email before linking`.

---

### Task 0: Shared booking core

**Files:**
- Create: `src/lib/booking/public-shape.ts` with `PublicBusiness`, `toWeekly` and `eligibleStaff`, moved out of `public.ts`, which re-exports them.
- Create: `src/lib/booking/slots.ts`, `src/lib/booking/slots.test.ts`.
- Modify: `src/app/[slug]/book/actions.ts`. `slotsFor` keeps the DB call and calls `slotsForDay`.

**Interfaces:**
- Produces: `slotsForDay(input: { business: PublicBusiness; serviceId: string; staffId: string | "any"; date: string; busy: { staff_id: string; starts_at: string; ends_at: string }[]; now: Date; locale: string }): { startsAt: string; label: string; staffIds: string[] }[] | null`. It is exactly today's `slotsFor` computation. `null` means an unknown service. Labels use `formatTime(…, business.timezone, locale)`.

- [ ] **Step 1: Write the failing tests** for `slotsForDay`, using a fixture business (Europe/Brussels, two professionals):
  - `merges professionals for "any"`;
  - `skips busy periods`;
  - `labels slots in the salon's time zone`. With `now` fixed, a 09:00 Brussels slot is labelled "09:00" whatever `TZ` is.
- [ ] **Step 2–4:** FAIL → implement → PASS. Then run root `npm run check`; the website booking page behaves exactly as before.
- [ ] **Step 5: Commit** `refactor: share the booking slot computation`

### Task 1: Client data layer and messages

**Files:**
- Create: `mobile/src/client/api.ts`, `mobile/src/client/errors.ts`, `mobile/src/client/errors.test.ts`.

**Interfaces:**
- Produces:
  - `linkSalon(code: string, categories: ClientCategory[]): Promise<{ ok: true; businessId: string; name: string; slug: string } | { ok: false; error: LinkError }>`. The code is uppercased and trimmed.
  - `unlinkSalon(businessId)`.
  - `listLinks()`, which includes unlinked links.
  - `myAppointments()`.
  - `bookAppointment({ businessId, serviceId, staffId, startsAt, note })`.
  - `cancelAppointment(id, reason?)`.
  - `ClientCategory` = the database enum.
- Produces: `linkErrorMessage(error, t, app)` and `bookingErrorMessage(error, t)`.
  - Reuse the website's `t.booking.errors.rpc` and `t.booking.manage.rpc` messages where a code exists there.
  - Add app strings only for the plan A codes: `email_not_confirmed`, `too_many_attempts`, `connection_code_invalid`, `plan_limit_customers`, `categories_required`, `customer_already_linked`, `client_link_required` and `too_many_bookings`.

- [ ] **Step 1: Write the failing tests:**
  - `maps every link error`;
  - `maps booking and cancel errors to the website's messages`;
  - `uses the generic message for unknown errors`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): client data layer`

### Task 2: Category icons and linking rules

**Files:**
- Create:
  - `mobile/src/client/CategoryIcon.tsx`: the website's `src/components/marketing/app-showcase/category-icons.tsx`, ported to `react-native-svg`.
  - `mobile/src/client/links.ts`, `mobile/src/client/links.test.ts`.

**Interfaces:**
- Produces: `<CategoryIcon category size color />`, and `categoryLabel(category, t)`, which uses the website's category names in `t.appShowcase`.
- Produces:
  - `mergeCategories(existing: ClientCategory[], added: ClientCategory[]): ClientCategory[]`: sorted and unique.
  - `tabsFromLinks(links): { category: ClientCategory; salons: { businessId; name; slug }[] }[]`: active links only, in the fixed category order hair, nails, beauty, brows, lashes, other.

- [ ] **Step 1: Write the failing tests:**
  - `keeps earlier categories when a salon is linked again`;
  - `one tab per category, salons grouped`;
  - `unlinked salons get no tab`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): categories and salon tabs model`

### Task 3: First run — choose services and link salons

**Files:**
- Create: `mobile/src/app/client/onboarding/{index,services,codes}.tsx`, `mobile/src/client/onboarding.test.tsx`.
- Modify: `mobile/src/app/client/_layout.tsx`. A client with no active links goes to onboarding.

**Interfaces:**
- Consumes: `linkSalon`, `mergeCategories` and `linkErrorMessage` from Tasks 1–2.
- Flow:
  1. **Welcome.**
  2. **Choose services:** multi-select of the six categories with icons. At least one must be chosen.
  3. **Codes:** one code field per chosen category. Each validates on "Link" and shows the salon's name once linked. The same code may be used for several categories; the app then links once with the merged categories.
  4. **Done:** goes to the first salon tab.
- When the email isn't confirmed: show the confirm-first message and a **Resend email** button (`supabase.auth.resend({ type: "signup", email })`). The button says the email was sent only when the call succeeds.

- [ ] **Step 1: Write the failing tests:**
  - `asks to confirm the email before linking`;
  - `shows the salon name after a valid code`;
  - `links one salon once for two categories with the same code`.
  The tests mock the api.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): client onboarding with salon codes`

### Task 4: Client tabs

**Files:**
- Create: `mobile/src/app/client/(tabs)/_layout.tsx`, `(tabs)/index.tsx`, `(tabs)/appointments.tsx` and `(tabs)/profile.tsx`. The profile tab is the shared profile with a "Linked salons" section; it reuses `mobile/src/app/profile.tsx` content via a component.
- Create: `mobile/src/client/ClientTabBar.tsx`, `mobile/src/client/ClientTabBar.test.tsx`.

**Interfaces:**
- Expo Router `Tabs` with a custom `tabBar`:
  - one button per entry of `tabsFromLinks`, showing the category icon and the salon's short name, or the category name when there are several salons. A button opens `index` with `?category=…`;
  - then **Afspraken** (appointments) and **Profiel**.
  - Several salons in one category: the tab opens a chooser listing those salons.
  - Accessibility: each button has an accessibility label naming the salon and category, and a selected state.

- [ ] **Step 1: Write the failing tests:**
  - `shows one button per category with the salon name`;
  - `marks the selected tab for screen readers`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): client tabs per linked salon`

### Task 5: Booking with a salon

**Files:**
- Create: `mobile/src/app/client/book/[slug].tsx`, `mobile/src/client/booking.ts`, `mobile/src/client/booking.test.ts`.

**Interfaces:**
- Consumes: `get_public_business(p_slug)` (as `PublicBusiness`), `get_public_busy_periods`, `slotsForDay` (Task 0) and `bookAppointment` (Task 1).
- Produces a pure step reducer, `bookingReducer(state, action)`:
  - states: `service` → `staff` (or "any") → `time` (date stepper within `horizon_days`, slots for that day) → `confirm` (summary, optional note, "you pay at the salon") → `done`.
  - `done` shows "request sent" when the result status is `pending` and "booked" when it is `confirmed`, using the website's texts.
- On `slot_unavailable` or `outside_booking_window`: go back to `time` with the message, and refetch the slots.

- [ ] **Step 1: Write the failing tests:**
  - `walks service → staff → time → confirm`;
  - `returns to times when the slot was taken`;
  - `pending bookings say the salon will confirm`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** Book at the demo salon from a test client account linked with Atelier Noor's code. The booking appears in the website's calendar and in **Afspraken**. Cancel it again afterwards.
- [ ] **Step 6: Commit** `feat(app): book with a linked salon`

### Task 6: Afspraken (appointments)

**Files:**
- Create: `mobile/src/client/appointments.ts`, `mobile/src/client/appointments.test.ts`.
- Modify: `mobile/src/app/client/(tabs)/appointments.tsx`.

**Interfaces:**
- Produces: `splitAppointments(rows, now): { upcoming; history; previousSalons }`.
  - Rows from unlinked salons go into `previousSalons`. Within it, upcoming ones come first and stay cancellable.
  - Upcoming is ordered soonest first; history newest first.
- Screen:
  - each card shows date, time (salon zone), treatment, price, status badge and salon;
  - **Cancel** appears only when `can_cancel`;
  - otherwise the website's "cancellation deadline passed — contact the salon" text appears, with the salon's name.

- [ ] **Step 1: Write the failing tests:**
  - `splits upcoming, history and previous salons`;
  - `keeps upcoming visits at previous salons cancellable`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): client appointments`

### Task 7: Linked salons in Profile

**Files:**
- Create: `mobile/src/app/client/salons.tsx`, `mobile/src/client/manage-links.ts`, `mobile/src/client/manage-links.test.ts`.

**Interfaces:**
- Produces:
  - `addSalon(code, categories)`;
  - `replaceSalon(oldBusinessId, code, categories)`: links the new salon **first**, and unlinks the old one only after that succeeds;
  - `unlink(businessId)`, which asks for confirmation explaining that history and upcoming visits stay and nothing is cancelled;
  - `editCategories(businessId, slug, categories)`, which calls `link_business_by_code` with the salon's current code. That code isn't known to the client, so editing goes through "add again with code". Ruling for the builder: Profile offers "Add a service for this salon" asking for the code.

- [ ] **Step 1: Write the failing tests:**
  - `keeps the old salon when the new code fails`;
  - `unlinks the old salon after the new one is linked`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat(app): manage linked salons`

### Task 8: Docs, test script and checks

**Files:**
- Modify:
  - `mobile/README.md`: add the client part of the manual script for spec flows 4, 5, 6, 7, 9 and 10;
  - `docs/ARCHITECTURE.md`;
  - `docs/ROADMAP.md`.

- [ ] **Step 1:** Write the script lines, check `npx expo-doctor`, run `npm --prefix mobile run check` and root `npm run check`, and build the Android bundle with `npx expo export --platform android`.
- [ ] **Step 2: Commit** `docs: NORYX app client side`
