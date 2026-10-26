# NORYX architecture

## Stack

| Layer       | Choice                                                                     | Why                                                                        |
| ----------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, React 19, Server Components & Server Actions)      | Server-first rendering, one codebase for site, workspace and booking pages |
| Language    | TypeScript (strict, `noUncheckedIndexedAccess`)                            | Strong types end-to-end                                                    |
| Styling     | Tailwind CSS 4 with CSS-first design tokens (`src/styles/tokens.css`)      | One source of truth for the design system                                  |
| Components  | Own components on Radix primitives (`radix-ui`), icons from `lucide-react` | Accessible dialogs, menus, tooltips, toasts without heavy UI kits          |
| Data & auth | Supabase: Postgres 17, Auth, Storage                                       | Postgres row-level security for tenant isolation; managed auth             |
| Validation  | Zod 4 schemas in `src/lib/validation`                                      | Same rules for every server action                                         |
| Tests       | Vitest; PGlite (Postgres in WebAssembly) for database tests                | RLS and booking rules tested without Docker                                |

Future iOS/Android apps can use the same Supabase backend: all authorisation lives in the database (RLS + functions), not in the web app.

## Routes

```
/                         marketing site (src/app/(marketing)): a short home page plus one page per
                          menu item (src/lib/navigation.ts SITE_NAV): /for-you, /booking-platform,
                          /apps, /pricing, /faq, /help (with the contact form at /help#contact)
/login /signup …          authentication (src/app/(auth)), /auth/confirm verifies email links
/onboarding               guided setup, saved step by step
/app/**                   salon workspace — one tree for owners, managers and staff;
                          navigation and pages adapt to permissions (src/lib/navigation.ts); /app/time time clock
/admin                    platform administration (platform admins only)
/<slug>                   public business page; /<slug>/book booking flow; /<slug>/shop click-and-collect;
                          /<slug>/booking/<token> private self-service link for a client's booking
/invite/<token>           accept a team invitation
/help, /app/help          help centre with courses (same content, public and inside the workspace)
/design-system            living design-system reference (noindex)
/api/assistant            website assistant (POST, streams NDJSON)
/api/health               deployment check: database reachable, migrations applied, site URL
```

Business slugs share the top-level namespace with app routes, so every current and planned route name is reserved in `src/lib/slug.ts`. With the own-domain extra (Pro), a salon's own domain is mapped to `/<slug>` in `src/proxy.ts` (see Custom domains below).

## Security model (defence in depth)

1. **Proxy** (`src/proxy.ts`) refreshes the Supabase session and redirects signed-out users away from `/app`, `/onboarding` and `/admin`. This is only an optimistic check.
2. **Data access layer** (`src/lib/auth/session.ts`): every page and server action resolves the user, the active business and the user's effective permissions on the server (`requireWorkspace`, `requirePermission`, `authorize`). The active business is remembered in an http-only cookie but re-validated against the user's memberships on every request.
3. **Database** — the real boundary:
   - RLS is enabled on every table. Policies call `has_business_permission()` / `can_manage()` (SECURITY DEFINER, empty `search_path`).
   - Table privileges are granted explicitly; `anon` has no direct table access at all. Column-level grants stop clients from changing protected columns (e.g. a business's `status`, appointment snapshots).
   - Composite foreign keys `(business_id, x_id)` make cross-tenant references impossible.
   - Suspended businesses stay readable (so owners can export data) but become read-only.
   - Platform admins get aggregate statistics only — they cannot read salons' client records (`20261021120300_platform_admin.sql`).

Tests in `tests/db/` prove these rules: cross-tenant reads and writes, role defaults, per-member grants/revocations, column protection, last-owner protection, admin least privilege.

### Roles and permissions

Roles: `owner` (everything), `manager`, `staff`. Each member can additionally have permissions granted or revoked. The catalogue lives in `public.permissions` / `public.role_permissions` and is mirrored in `src/lib/auth/permissions.ts`; a test fails if they drift apart. Finance permissions are **not** given to managers or staff by default.

Bookable professionals (`staff_members`) are separate from logins (`business_members`): many salon employees never sign in. A staff profile can be linked to a login via `user_id`, which powers "own calendar" access.

## Data model (current)

```
auth.users ─┬─ profiles
            ├─ platform_admins
            └─ business_members ── businesses ─┬─ business_subscriptions ── plans (features, limits)
                                               ├─ business_invitations (hashed tokens)
                                               ├─ locations ── location_hours
                                               ├─ service_categories ── services
                                               ├─ staff_members ─┬─ staff_services (per-staff price/duration)
                                               │                 ├─ staff_working_hours (weekly, breaks = gaps)
                                               │                 └─ staff_time_off
                                               ├─ customers ── customer_notes (separate permission)
                                               ├─ appointments ─┬─ appointment_events (history)
                                               │                └─ payments (recorded at the salon, refunds marked)
                                               ├─ expenses
                                               ├─ products ── inventory_movements (stock only changes here)
                                               ├─ orders ── order_items (price snapshots)
                                               ├─ notifications (outbox)
                                               └─ audit_events
storage: business-assets/<business_id>/… (logo, cover; public read, settings managers write)
```

Conventions: UUID keys; `timestamptz` in UTC, displayed in the business time zone; weekly times as minutes after local midnight with ISO weekdays; money as integer cents with a currency code (EUR default); appointments snapshot service name, duration and price so history survives edits.

## Booking engine

- `src/lib/booking/availability.ts` is a pure function: opening hours ∩ staff hours, minus busy periods (appointments incl. buffers, time off), with minimum notice, horizon, slot interval and the larger of business/service buffer. Unit-tested including daylight-saving changes.
- Public pages read data through `get_public_business()` and `get_public_busy_periods()` (SECURITY DEFINER, public fields only, no client data).
- A booking is submitted to a server action that re-computes availability, then calls `create_online_booking()` with the service-role client. That function re-validates every rule in SQL (service, staff, working hours, opening hours, time off, notice, horizon, slot grid) and inserts customer + appointment + outbox rows in one transaction.
- **Double-booking prevention**: an exclusion constraint on `(staff_id, tstzrange(starts_at, blocked_until))` for pending/confirmed appointments. Concurrent bookings for the same time cannot both succeed.
- Booking and availability endpoints are rate-limited per IP (in-memory; replace with a shared store such as Redis when running multiple instances).

## Team, retail, finance and plans

- **Team**: invitations carry a 192-bit token stored only as a SHA-256 hash, expire after 7 days and can only be accepted by the invited email address. Member changes go through SECURITY DEFINER functions that block self-escalation, owner changes by non-owners and granting permissions the granter lacks.
- **Retail**: stock changes only through `inventory_movements`; a CHECK constraint makes negative stock impossible. `create_online_order()` (service role only) locks product rows, computes totals from current prices and reserves stock atomically; `cancel_order()` restocks in the same transaction. Orders are unpaid until the salon marks them paid at pickup.
- **Finance**: payments are records of what was paid at the salon (NORYX processes no payments). Front-desk staff can record payments without seeing figures; totals need `finance.view`. Recorded revenue, expenses and booked-value estimates are always shown separately. Not accounting or VAT software.
- **Plans & entitlements**: two plans. **Basic** is the booking system with at most 250 customers. **Pro** adds unlimited customers, `finance`, `inventory`, `shop`, `branding`, `team_permissions`, `time_clock` and eligibility for `custom_domain`. Extra options on the pricing page: the own domain with a custom webpage (one-time €150, Pro only) and a newsletter (€5/month, not built yet); amounts in `src/lib/billing/pricing.ts`. An earlier Ultra plan was folded into Pro (migration `20261024092000_custom_domain_extra.sql`).
  - **Enforcement**: database triggers enforce the customer limit and every Pro feature (payments, expenses, products, manual stock changes, orders, branding changes, per-member permissions).
  - **Public pages**: they hide branding and the shop without the feature.
  - **Billing**: prices are not set and no billing provider is connected, so platform admins assign plans with an audit trail.
- **Gift cards** (Basic and Pro; migration `20261023090000_gift_cards.sql`): `gift_cards` plus an append-only ledger `gift_card_transactions` (issue, redeem, reversal, adjustment, cancellation, each with the balance after it). `gift_cards.balance_cents` is a cached copy changed only by SECURITY DEFINER functions under `FOR UPDATE`, so concurrent redemptions can't overspend; clients have SELECT only.
  - **Lifecycle**: an online order (`create_online_gift_card`, service role only, rate-limited) stays `pending` without code or value. The salon activates it after recording payment at the desk (`activate_gift_card`, refused when not pending, so a repeated confirmation never credits twice); `create_desk_gift_card` sells and activates in one step.
  - **Codes**: 16 Crockford base-32 characters (80 random bits from `gen_random_bytes`), returned once at activation; only the SHA-256 hash and last four characters are stored. Input is normalised (case, dashes, O→0, I/L→1). Lookups are scoped to the salon; an unknown code and another salon's code get the same answer. The public balance check (`get_gift_card_by_code`, service role) and staff redemptions are rate-limited, in memory per server instance and keyed on the first `x-forwarded-for` address. That limits casual guessing only; the 80-bit codes are the real protection.
  - **Money**: redeeming (`redeem_gift_card`) debits the card for an appointment or order; on plans with `finance` it also records a payment with method `voucher` (revenue is recognised on redemption, not on sale, as confirmed by the product owner). `redeem_gift_card` locks the appointment or order and refuses more than is still due (`gift_card_due_cents`: price minus non-card payments minus earlier card redemptions), and refuses cancelled appointments and cancelled or settled orders. A payment created by a redemption can only be refunded by reversing the redemption (trigger `payments_protect_gift_card`). Desk sales, redemptions and corrections take an idempotency key per form, so a retried request acts once (migration `20261023100000_gift_card_fixes.sql`). Reversals restore the balance once and mark the linked payment refunded; blocking, cancelling (writes off the rest) and corrections need `gift_cards.manage` and a reason, and are written to the audit log.
  - **Not decided by NORYX**: expiry (`gift_card_validity_months`, NULL by default), the salon's own conditions text, and refunds to buyers (outside NORYX).
- **Client self-service**: each online booking gets a private management link (token hashed in `appointments.manage_token_hash`). Through it the client deletes the booking (`delete_booking_by_token`), which the database refuses after the salon's cancellation deadline.
- **Deleting appointments** (migration `20261023122000_appointment_deletion.sql`): `delete_appointment()` (salon: `appointments.manage_all`, or `manage_own` for the professional's own) and `delete_booking_by_token()` (client) remove the appointment, its history and its outbox rows. Recorded payments stay for the bookkeeping, unlinked (`appointment_id` set to NULL). The audit log keeps only that an appointment was deleted and by whom (`business` or `client`). A client deletion leaves the salon one outbox notice with just the time and service.
- **Time clock** (Pro; migration `20261023121000_time_clock.sql`): `time_entries` with an exclusion constraint against overlapping entries and at most one open entry per professional. Professionals clock in and out only for their own linked staff profile (`clock_in()` / `clock_out()`, needs `schedule.manage_own`); they see only their own entries. Members with `staff.manage` see everyone's, correct or delete entries (`save_time_entry()` / `delete_time_entry()`, audited) and export a week as CSV (`/app/time/export`). Clients have SELECT only.
- **Custom domains** (the own-domain extra on Pro; migrations `20261023120000_ultra_plan_custom_domains.sql` and `20261024092000_custom_domain_extra.sql`): platform admins assign `businesses.custom_domain` once the extra is paid (`admin_set_custom_domain`, audited, refused unless the business has `custom_domain`, i.e. Pro). For any host that isn't the platform's own, `src/proxy.ts` asks `resolve_custom_domain()` (cached 60 s) for the slug and rewrites `/`, `/book`, `/shop`, `/gift-card` and `/booking/…` to that salon's pages; it only answers for active Pro salons with booking enabled. DNS, TLS and the hosting provider's domain settings are manual steps.
- **Website assistant** (`/api/assistant`, widget in the marketing layout): answers from the website's own content only. `src/lib/assistant/knowledge.ts` builds that content per language from the dictionaries and help courses, so it never drifts from the pages. With `ANTHROPIC_API_KEY` set it streams an answer from Claude (`claude-haiku-5-5`, chosen for cost, about 0.2 cent per answer; low effort, prompt-cached knowledge block; a declined question gets the "no answer" text). Without a key it says so honestly and shows the best-matching FAQ and help answers (keyword search). Requests are same-origin only, limited to 20 per visitor per 10 minutes and 600 per hour overall (in memory), and capped at 20 messages of 2,000 characters. Nothing is stored.
- **Support requests** (migration `20261024091000_support_requests.sql`): the contact form on `/help` stores questions in `support_requests` through `submit_support_request()` (anon and signed-in visitors; at most 5 per address per hour in the database, plus a per-visitor limit and a honeypot in the server action). Platform-level data, so no `business_id`. Only platform admins can read, close (`admin_set_support_request_status`) or delete (`admin_delete_support_request`, for erasure requests) them, in `/admin`; both are audited. Nothing is emailed: the team replies by email by hand.
- **Deployment checks**: `next.config.ts` fixes `NEXT_PUBLIC_SITE_URL` at build time with `src/lib/site-url.ts` (on Vercel a missing or localhost value becomes the deployment URL) and records the newest migration as `NORYX_SCHEMA_VERSION`. `/api/health` compares that with `public.schema_version()` (migration `20261024090000_schema_version.sql`). Failed database calls are logged with code, message and hint by `src/lib/supabase/errors.ts`; missing tables, columns or functions add a `database.schema_outdated` log line.
- **Uploads**: logo and cover images are validated by size (≤ 2 MB) and file signature (PNG/JPEG/WebP) on the server, then stored in the business's own Storage folder; Storage policies enforce the folder boundary.

## Languages (i18n)

Dutch is the default interface language; French and English are also available. `src/i18n/config.ts` lists the locales; the visitor's choice is stored in the `noryx_locale` cookie (set by the NL | FR | EN switch), otherwise the `Accept-Language` header decides.

- Strings live in typed dictionaries per area in `src/i18n/dictionaries/{en,nl,fr}/`. Each Dutch and French file is typed as `typeof` its English twin, so a missing key fails to compile, and `dictionaries.test.ts` also compares list lengths and function arities.
- Server components and actions call `getT()` / `getI18n()` (`src/i18n/server.ts`); client components use `useT()` / `useIntlLocale()` from `I18nProvider`.
- Validation schemas are factories that take the dictionary (`productSchema(t)`, built on `rules(t)` in `src/lib/validation/common.ts`), so error messages come back in the visitor's language. Database errors are mapped to translated messages in `databaseErrorMessage`.
- Dates and durations use the interface locale (nl-BE / fr-BE / en-GB); money keeps the business locale.
- Help-centre courses are long-form content in `src/content/help/{nl,fr,en}.ts`; screenshots and the animated cursor targets come from `npm run help:screenshots`. `SCREENSHOT_LOCALE` in `src/content/help/index.ts` picks which language's captures a locale shows (French uses English until its own are captured).

## Notifications

Booking, cancellation and order events write rows to `notifications` (outbox). `src/lib/notifications.ts` marks them `skipped` with the reason "No email provider configured" until a provider is integrated — the product never claims a message was sent. Auth emails (confirmation, password reset, email change) are sent by Supabase Auth using the branded templates in `supabase/templates/`.

## Client accounts (NORYX app)

- Every salon has one active **connection code** (`business_connection_codes`, e.g. `ATEL-7KQ2MX`: slug letters plus six characters without look-alikes; older four-digit codes stay valid), shown in Settings and created on first view (`ensure_connection_code`); `regenerate_connection_code` (settings.manage, audited) deactivates the old code without breaking existing links.
- A client links a salon with `link_business_by_code(code, categories)`: requires a confirmed email, at most 10 attempts per 15 minutes, unknown and inactive codes give the same error, the Basic customer limit applies. It reuses the salon's customer with the same email (setting `customers.user_id`) or creates one; a customer record has at most one live link (`customer_already_linked`). Links live in `client_links` (own rows only).
- **Privacy rule**: a client sees only appointments created since linking (`my_appointments`). Unlinking keeps the history up to that moment visible and cancellable, never cancels anything, and stops new bookings.
- `client_book_appointment` runs `create_online_booking` with the linked customer's details, so the salon's own rules apply unchanged (plus 6 bookings per user per hour); `client_cancel_appointment` applies the same deadline as the private booking link.
- **Account deletion** (`POST /api/account/delete` for the app, bearer token only; a card under Account on the website): `prepare_account_deletion` refuses while the user is a salon's only owner, clears `customers.user_id`, removes links and memberships; the server then deletes the auth user. Salons keep their client records.

## The NORYX app (`mobile/`)

- **Stack:** Expo (SDK 58), Expo Router and TypeScript. It is its own npm project with its own `npm run check`. The website's tsconfig and ESLint ignore `mobile/`.
- **Shared code:** the app imports pure modules from `src/` through `@/…`:
  - `time`, `format`, appointment status rules, navigation, the time clock, validation schemas, `databaseErrorMessage` and the dictionaries;
  - Metro `watchFolders` includes `../src`.
  - It never imports server-only modules (`@/lib/supabase/server`, `@/lib/auth/session`, `next/*`). Shared modules must not import web UI components. That is why `gift-card-codes.ts` was split out of `gift-cards.ts`.
- **Data and sessions:**
  - The app uses the same Supabase project and publishable key as the website, with the user's own session.
  - RLS, the status trigger and the overlap constraint decide every action, exactly as on the website.
  - The session is stored in the Keychain/Keystore through `expo-secure-store`, split into chunks.
  - When the session ends without the user signing out, the app returns to sign-in with a message.
- **Routes:**
  - `/sign-in` and the other account screens;
  - `/salon`: a stack with the workspace, the tabs Today · Calendar · Clients · Clock · More, and appointment and client details pushed on top;
  - `/client` (plan C);
  - `/profile` and `/delete-account`.
  - Side choice: team members go to the salon side; clients and new accounts go to the client side. Someone who is both returns to the side they used last, or picks a side on first use.
- **Moving an appointment** goes through `reschedule_appointment`. It is SECURITY INVOKER, keeps the buffer, and raises `appointment_not_found` when RLS hides the row. The website's action uses it too.
- **Website routes for the app:** both accept a bearer token only.
  - `POST /api/account/delete`.
  - `POST /api/app/web-link`: returns a one-time magic link to `/auth/confirm?…&next=/app/…`, so "More" opens workspace pages already signed in.
    - `workspacePath` allows only `/app` paths.
    - It is limited to 10 links per minute per user.
    - `generateLink` sends no email.

## Privacy (GDPR preparation)

Legal pages (`/privacy`, `/cookies`, `/terms`, `/legal`) are built from `src/content/legal/` with the operator details from `src/lib/legal.ts`; a test keeps the three languages structurally identical and the cookie table in line with the cookies the app sets. Cookies: Supabase auth (`sb-…-auth-token`, code verifier), `noryx_business` (session) and `noryx_locale` (1 year); no analytics or third-party scripts, fonts are self-hosted.

Customer export (JSON) and erasure (anonymisation that keeps bookkeeping records) per customer, CSV export of the customer list, separate permission for private notes, marketing consent stored explicitly, logs redact personal fields (`src/lib/logger.ts`), EU hosting recommended. These features support GDPR obligations; they do not by themselves make a business compliant.

## Trade-offs and known limitations

- Single location per business in the UI; the schema already supports several (`locations`).
- Product variants (size, colour) are not modelled yet; each variant is a separate product for now.
- Invitation links must be shared manually until an email provider is connected.
- Customer selection in "New appointment" loads up to 500 customers into a native select; switch to server-side search before large salons onboard.
- The marketing page is server-rendered because the header reads the session; it can be made static with a client-side session check.
- Pages denied after streaming has started render the 404 view with HTTP 200 (Next.js streaming behaviour); no data is rendered.
- A nonce-based Content-Security-Policy is still to be added (other security headers are set in `next.config.ts`).
