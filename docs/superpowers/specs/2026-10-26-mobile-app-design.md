# NORYX mobile app — design

Status: **approved** by the owner on 2026-10-26 · owner: Collin Soete

## 1. Intent

NORYX is a booking and business platform for beauty businesses (hair salons, barbers,
beauty, nail, lash & brow studios, independent professionals) in Belgium/Europe. Today it
is a Next.js website with two sides:

- **Salons and their teams** work in the web workspace (`/app`).
- **Clients** book without an account on a salon's booking page (`/<slug>`).

The website (`/apps`) promises a NORYX app for both sides "coming to iOS and Android",
including a client app where one account links several salons, each with its own code.
This project delivers that: **one native NORYX app for iOS and Android** that serves
both sides, recognisably the same product as the website.

## 2. Goals, non-goals, anti-goals

**Goals**

1. One app, two sides. After sign-in the app opens the side that fits the account; a
   person who is both client and team member can switch.
2. **Salon side** for what people do on their phone during the day:
   - **Today**: today's appointments, bookings waiting for approval, setup checklist.
   - **Calendar**: day and week view per professional; open an appointment to confirm,
     complete, mark no-show, cancel, reschedule or record a payment.
   - **Clients**: search, view the client record, call or email.
   - **Time clock**: clock in/out and view own hours (the existing time clock feature).
   - **More**: the remaining workspace sections (settings, finance, products, orders,
     gift cards, team, help) open the existing web pages inside the app.
3. **Client side** (new; follows what `/apps` promises):
   - One client account (email + password, as on the website).
   - First run: choose the services you use (several allowed), then link each salon with
     **that salon's own connection code**. Links are remembered; codes are entered once.
   - Bottom tab bar with one icon per linked salon (by category); tapping it opens booking
     with **that** salon directly. Several salons in one category → choose between them.
   - Upcoming appointments (view, cancel within the salon's rules) and history per salon:
     date, time, treatment, price, status.
   - Settings: see linked salons, replace, add, or unlink a salon; the account stays.
4. Same visual identity as the website (section 6), adapted to native iOS/Android
   controls.
5. Every screen has clear loading, empty, error and success states, works with large
   text and screen readers, and supports Dutch, French and English like the website.

**Non-goals (first version)**

- Online payment or deposits (no payment provider chosen).
- Push notifications or emails (no email/push provider chosen). Designed for later.
- Rebuilding settings, finance, stock, webshop, team or plan management natively.
- Publishing to the App Store / Google Play (needs developer accounts; the build must be
  store-ready, the submission is a later step).
- Offline editing. Read-only data may be shown from cache when offline, clearly marked.

**Anti-goals**

- Any screen or button that pretends something works when it doesn't (e.g. "paid",
  "email sent"), consistent with the website's honesty rules.
- A generic list of strangers' salons where the client has linked a specific one.
- A second, diverging set of business rules: authorisation stays in the database.

## 3. Constraints

- **Backend is shared**: the same Supabase project, auth users, tables and row-level
  security as the website. Authorisation lives in the database (RLS + SECURITY DEFINER
  functions with `set search_path = ''`), exactly as the project conventions require.
- **No new backend platform**: no separate API server. Where the app needs something the
  browser gets through Next.js server actions, it becomes a database function (RPC) or a
  small Next.js route handler (`src/app/api/...`), whichever keeps the rule in the DB.
- **Online booking today runs with the service role** (`create_online_booking` is granted
  to `service_role` only, called from a server action after rate limiting). The app can't
  hold that key, so client booking needs a path for authenticated clients (section 5.3).
- The developer works on Windows: iOS builds go through Expo's cloud build (EAS); testing
  happens on a real phone with Expo Go / a development build.
- Money is integer cents; times are UTC instants and local `YYYY-MM-DD` dates, as in the
  web app. Formatting follows the salon's locale, like the website.

## 4. Approaches considered

| Approach | What it means | Trade-offs |
|---|---|---|
| A. Installable web app (PWA) | Extend the Next.js site into an app-like experience | Least work, one codebase; no store presence, weaker iOS push |
| **B. Native iOS + Android app (chosen)** | Expo (React Native) app sharing the Supabase backend | Best native feel, store presence, full push later; a second UI codebase, store accounts and reviews |
| C. PWA wrapped for the stores | Capacitor around the web app | Store presence with one UI; risk of Apple rejecting "website in a wrapper" |

The owner chose **B**, and **one app for both sides** (not separate client and business
apps).

## 5. How it works

### 5.1 Technology (builder's defaults, owner may override)

- **Expo SDK (React Native) + TypeScript**, Expo Router for file-based navigation (tabs and
  stacks), in a new folder `mobile/` in this repository.
- `@supabase/supabase-js` with secure session storage (Expo SecureStore) and the same
  publishable key and URL as the website.
- Reuse pure TypeScript from the website where it has no web/server dependencies:
  `src/lib/booking/availability.ts` (slot computation), `src/lib/time.ts`,
  `src/lib/format.ts`, `src/lib/auth/permissions.ts`, the `src/types/database.ts` types and
  the i18n dictionaries (or the subset the app needs). Exact sharing mechanism (Metro
  `watchFolders`/path alias vs. a small shared package) is the builder's call.
- Fonts: Cormorant Garamond and Manrope via `expo-font`; icons: lucide (`lucide-react-native`)
  plus the NORYX category icon set from the website (`category-icons.tsx`, ported to
  `react-native-svg`).

### 5.2 Which side opens

- After sign-in the app loads the user's **business memberships** (as the website does)
  and **client links** (new, 5.3).
- Only memberships → salon side. Only client links (or neither) → client side. Both → the
  last used side, with a switch in the profile screen.
- A brand-new account goes to the client onboarding; salons are still created on the
  website (link "Run a salon? Set it up on noryx…").

### 5.3 New backend for the client side

**Connection codes — one per salon (owner decision).** The client picks the professional
when booking, as on the website. The website's app preview currently promises "each
professional gets a code of their own"; that copy is corrected to "each salon" as part of
this project.
- New table `business_connection_codes`: `business_id`, `code` (short, readable, unique,
  e.g. `ELS-4821` style: letters from the business name + random digits, Crockford-safe),
  `active`, `created_at`, `created_by`. One active code per business; the owner can
  regenerate it (old code stops working; existing links stay).
- Visible and regenerable in the web workspace (Settings) for members with
  `settings.manage`; shown read-only to other members so the front desk can share it.

**Client links.**
- New table `client_links`: `user_id`, `business_id`, `customer_id` (the business's
  `customers` row for this person), `categories` (one or more of hair, nails, beauty,
  brows, lashes, other — one salon can serve several of the client's services; *builder's
  call*), `linked_at`, `unlinked_at` (null while linked). Unique `(user_id, business_id)`.
  RLS: a user sees only their own links.
- `link_business_by_code(p_code, p_categories)` (SECURITY DEFINER, authenticated):
  - **Requires a confirmed email** (`auth.users.email_confirmed_at` not null); otherwise a
    clear "confirm your email first" error. Sign-up in the app sends the same Supabase
    confirmation as the website. *(Owner: "do what's best".)*
  - Validates the code; unknown and inactive codes return the same generic error;
    rate-limited per user.
  - Finds or creates the business's `customers` row for the user's email (reusing an
    existing row with that email, setting `customers.user_id`), respecting the plan's
    customer limit, and records `linked_at`.
  - Re-linking a previously unlinked salon reactivates the same link.
- `unlink_business(p_business_id)`: sets `unlinked_at`; nothing at the salon is deleted or
  cancelled (it is the salon's data).

**Privacy rule for history.** A client sees only appointments created **on or after the
moment they linked** that salon (`appointments.created_at >= linked_at`), so visits a
salon recorded before the person had an account — or records that merely share an email —
are never exposed. *(Owner: "do what's best".)*

**Client data access.** Authenticated, scoped to the caller's own links (active or
unlinked):
- `my_appointments()`: upcoming and past appointments of the linked customer rows, within
  the privacy rule above, with salon name, service, staff, times, price, status, and
  whether the salon is still linked. After unlinking, history stays visible under
  "previous salons", and upcoming appointments stay in place and can still be cancelled
  within the salon's deadline; unlinking never cancels anything. *(Owner: "do what's best".)*
- `client_book_appointment(...)`: the same checks as `create_online_booking` (service,
  staff, slot, notice, horizon, overlap, approval) but for the caller's linked customer
  row, so the client doesn't retype details. Implemented by sharing the existing
  function's logic (refactor into an internal function both call) rather than copying it.
- `client_cancel_appointment(p_appointment_id)`: same deadline rule as the existing
  self-service cancel, for the caller's own appointments only.
- Public catalogue and availability reuse `get_public_business` and
  `get_public_busy_periods` (already granted to `authenticated`) plus the shared
  `computeAvailability`.

All new tables and functions follow the conventions: `business_id`, RLS, explicit grants,
composite FKs, tests in `tests/db/`, permission keys mirrored if any are added.

### 5.4 Salon side data

The salon side uses the existing tables and RPCs directly with the user's own session;
RLS already limits what each role sees (e.g. staff see only their own appointments and
clients, finance needs `finance.view`). Actions the website performs via server actions
with extra checks (status changes, reschedule, record payment, time clock) are called as
the same database writes/RPCs; where a server action holds logic that isn't in the
database, it moves into an RPC so web and app share it.

"More" sections open the matching web page in an in-app browser with the user's session
(builder to choose the safest way to hand over the session, e.g. a short-lived sign-in
link handled by `/auth/confirm`).

### 5.5 Screens

**Shared**: splash → sign in / create account / forgot password (same rules and messages
as the website) → side picker (only when both apply) → profile (language, switch side,
sign out, **delete account**).

**Account deletion (required for the App Store; new, also on the website).** A
confirmation screen, then a server-side deletion (a small `src/app/api` route using the
service role, or an RPC plus the auth admin API): the auth user and their client links
are removed; at each salon the `customers` row stays as the salon's record with
`user_id` cleared. Business owners must first hand over or close their business (the
existing "keep at least one owner" rule). The privacy policy gets a sentence about client
accounts; legal review is flagged, not done. *(Owner: "do what's best".)*

**Salon side** (tab bar): Today · Calendar · Clients · Clock · More.
- Appointment detail (stack): status actions with confirmation for cancel, reschedule
  sheet, record payment (Pro), redeem gift card (as on the web), internal note.
- Client detail (stack): contact actions (call, email), upcoming and past visits, notes
  if the role allows.

**Client side** (tab bar): one tab per linked salon (category icon + salon short name),
then **Afspraken** (upcoming + history) and **Profiel**.
- First run: welcome → choose services (multi-select) → enter one code per chosen service
  (each shows the salon's name once validated) → done.
- Salon tab: the salon's services → professional → date and time → confirm (same steps,
  rules and wording as the web booking flow; "you pay at the salon").
- Several salons in one category: the tab opens a chooser.
- Profile → Linked salons: add (code), replace, unlink; language; sign out.

### 5.6 Visual direction (from the website)

- Colours from `src/styles/tokens.css`: ivory canvas, white surfaces, champagne and rose
  gold for warmth, pink-700 `#b83d5d` for primary actions; rose gold/pink ≤ 400 only
  decorative; status never by colour alone.
- Type: Cormorant Garamond for screen titles and large numbers, Manrope for everything
  else; sizes follow the platform's dynamic type.
- Shapes: generous radius (cards ~20–28 px), soft warm shadows, 1 px hairlines, pill
  buttons; the NORYX symbol on splash and empty states.
- Native behaviour: iOS large titles, swipe back, sheets for pickers and confirmations;
  Android back button and system bars; haptic feedback on confirm actions.
- Motion: short and purposeful; respects "reduce motion".

## 6. Quality bar

- Loading skeletons, empty states with one clear next step, inline errors that say what
  to do, success confirmations; no dead ends.
- Accessible labels on every control, touch targets ≥ 44 pt, works at the largest text
  size, VoiceOver/TalkBack order matches the visual order.
- NL/FR/EN, defaulting to the device language (client side) or the salon's language
  (salon side), consistent with the website's rules.
- Tests: database tests for every new table/function (tenant isolation, code guessing,
  linking, booking rules, cancellation deadline); unit tests for shared logic; a manual
  test script for the main flows on a real iPhone and Android phone.

## 7. Main user flows to verify at the end

1. Owner signs in → Today → opens an appointment → confirms it.
2. Staff member clocks in and out → sees their hours.
3. Owner finds the connection code in the web workspace.
4. New client creates an account → chooses hair + nails → enters two different codes →
   sees two tabs.
5. Client taps the hair tab → books a time → it appears in the salon's calendar (web and
   app) and in the client's Afspraken.
6. Client cancels within the deadline; outside it, the app explains why not.
7. Client replaces salon A with salon B in Profile; history of A stays visible under
   "previous salons", and an upcoming appointment at A can still be cancelled.
9. A client account can't see visits from before it linked the salon, and can't link
   with an unconfirmed email.
10. A client deletes their account; the salon still has the client record, unlinked.
8. Person who is client and staff switches sides.

## 8. Left to the builder

Folder layout inside `mobile/`, state/data-fetching library, exact sharing mechanism for
TypeScript code, code format details, the in-app browser session hand-over, and the order
of work — within the conventions above.

## 8b. Test environment (owner decision)

The owner chose to use the **existing hosted Supabase project** (`abizqbkvnoatwgpsgduz`,
eu-west-1, holding the "Atelier Noor" demo salon) rather than a separate test project.
The 7 pending migrations from main and this project's migrations are applied there, and a
demo connection code is created for the demo salon. Migrations stay additive and
reversible, so the website keeps working throughout. The app reads its Supabase URL and
publishable key from Expo environment variables, so moving to another project later
needs no code change.

## 9. Open items outside this project

- Apple and Google developer accounts and store listings (needed to publish).
- Email/push provider (needed for confirmations and reminders).
- Payment provider (needed for online payment).
- Legal review of the privacy-policy sentence on client accounts.
