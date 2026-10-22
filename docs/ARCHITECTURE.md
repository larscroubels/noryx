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
/                         marketing site (src/app/(marketing))
/login /signup …          authentication (src/app/(auth)), /auth/confirm verifies email links
/onboarding               guided setup, saved step by step
/app/**                   salon workspace — one tree for owners, managers and staff;
                          navigation and pages adapt to permissions (src/lib/navigation.ts)
/admin                    platform administration (platform admins only)
/<slug>                   public business page; /<slug>/book booking flow; /<slug>/shop click-and-collect;
                          /<slug>/booking/<token> private self-service link for a client's booking
/invite/<token>           accept a team invitation
/help, /app/help          help centre with courses (same content, public and inside the workspace)
/design-system            living design-system reference (noindex)
```

Business slugs share the top-level namespace with app routes, so every current and planned route name is reserved in `src/lib/slug.ts`. Custom domains can later be mapped to `/<slug>` in `src/proxy.ts`.

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
- **Plans & entitlements**: two plans. **Basic** is the booking system with at most 250 customers. **Pro** adds unlimited customers, `finance`, `inventory`, `shop`, `branding` and `team_permissions`. New businesses get a 14-day Pro trial (`business_subscriptions.trial_ends_at`); `business_effective_plan()` makes an expired trial fall back to Basic. `business_has_feature()` / `business_plan_limit()` are the single source of truth, mirrored by `src/lib/billing/entitlements.ts`.
  - **Enforcement**: database triggers enforce the customer limit and every Pro feature (payments, expenses, products, manual stock changes, orders, branding changes, per-member permissions).
  - **Public pages**: they hide branding and the shop without the feature.
  - **Billing**: prices are not set and no billing provider is connected, so platform admins assign plans with an audit trail.
- **Client self-service**: each online booking gets a private management link (token hashed in `appointments.manage_token_hash`); cancellation through it is refused by the database after the salon's cancellation deadline.
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

## Privacy (GDPR preparation)

Customer export (JSON) and erasure (anonymisation that keeps bookkeeping records) per customer, CSV export of the customer list, separate permission for private notes, marketing consent stored explicitly, logs redact personal fields (`src/lib/logger.ts`), EU hosting recommended. These features support GDPR obligations; they do not by themselves make a business compliant.

## Trade-offs and known limitations

- Single location per business in the UI; the schema already supports several (`locations`).
- Product variants (size, colour) are not modelled yet; each variant is a separate product for now.
- Invitation links must be shared manually until an email provider is connected.
- Customer selection in "New appointment" loads up to 500 customers into a native select; switch to server-side search before large salons onboard.
- The marketing page is server-rendered because the header reads the session; it can be made static with a client-side session check.
- Pages denied after streaming has started render the 404 view with HTTP 200 (Next.js streaming behaviour); no data is rendered.
- A nonce-based Content-Security-Policy is still to be added (other security headers are set in `next.config.ts`).
