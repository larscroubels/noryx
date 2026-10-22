# NORYX roadmap

Status as of 22 October 2026. The full product brief is in [`PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md).

## Phase 1 — Audit and foundation ✅

- Repository audit (empty apart from the logo); Node 26, Next.js 16, TypeScript, Tailwind 4.
- Brand asset pipeline from the supplied logo (lockup, wordmark, symbol, favicons, app icons, OG image).
- Design tokens, component library, `/design-system` reference, automated contrast test.
- Environment handling, Supabase clients, session-refreshing proxy, local Supabase via Colima.
- Database foundation: tenancy, roles and permissions, locations, audit log, RLS everywhere; PGlite test harness.

## Phase 2 — Website, authentication, onboarding ✅

- Landing page (presents only features that exist; roadmap items marked "In development").
- Sign-up with email verification, sign-in, sign-out, password reset, email change, branded auth emails.
- Protected routes, role- and plan-aware navigation, guided onboarding saved step by step.

## Phase 3 — Core business management ✅

- Business profile, branding (logo, cover, accent colour), location, opening hours with breaks, booking policies.
- Services with categories, promotional prices, buffers, online visibility, staff assignment.
- Staff profiles, weekly hours with breaks, time off, per-staff prices/durations; "My schedule" for staff.
- Team: invitations (linked to staff profiles), roles, per-member permissions, removal.
- Customers: search, sort, pagination, profile, statistics, private notes, CSV export, GDPR export and erasure.
- Dashboard with real data, setup checklist, approvals, low stock, open orders.
- **Open:** multiple locations in the UI, staff photos.

## Phase 4 — Booking system ✅

- Public business page and mobile-first booking flow ("any professional", first-available day), add-to-calendar.
- Availability engine (pure, tested), server re-validation, database-level double-booking prevention.
- Calendar day/week/month with side-by-side overlaps, staff filter, booking requests.
- Appointment detail: status changes, reschedule, cancel with reason, internal notes, history, payments.
- Client self-service: private link to view and cancel within the salon's cancellation deadline.
- Notification outbox (honestly marked "skipped" without a provider).
- **Open:** email/SMS provider and reminders, client accounts, drag-and-drop calendar, self-service rescheduling.

## Phase 5 — Products & webshop ✅ (first version)

- Products with SKU, category, price, cost, low-stock warnings; stock movement history; negative stock impossible.
- Click-and-collect shop on the public page; atomic orders with server-side totals; order workflow and cancellation with restock; unpaid/paid/refunded.
- **Open:** product variants, product images, delivery, online payments.

## Phase 6 — Finance & reporting ✅ (first version)

- Recorded payments (incl. refunds), expenses, summaries per period, service, professional and payment method; booked value as separate estimate; CSV exports.
- **Open:** revenue per location, product sales report, charts over time. Not accounting or VAT-filing software.

## Gift cards ✅ (first version)

- Clients order a gift card on the salon's booking page (`/<slug>/gift-card`) and pay at the salon; the salon activates it once paid, or sells and activates one at the desk. The code is shown once. Holders check balance and history with the code; staff redeem it (partially, combined with other methods, several cards per purchase) from an appointment or shop order. Ledger with reversals, corrections, blocking and cancellation, all audited. Settings: online sales on/off, fixed and custom amounts, optional validity in months, the salon's own conditions.
- **Open:** online payment (needs the payment provider), email delivery of codes (needs the email provider), printable/PDF card, re-issuing a lost code, erasing a buyer's personal data on request, a gift card report in finance.

## Phase 7 — SaaS administration ✅ (first version)

- Platform admin area with statistics, business list, status and plan management, audit log; least-privilege access.
- Plans and central entitlements (features + limits enforced in the database): Basic (booking system, up to 250 customers) and Pro (payments & finance, stock, webshop, branding, custom permissions), with a 14-day Pro trial that falls back to Basic. Public pricing page at `/pricing` (prices "coming soon") and FAQ page at `/faq`.
- **Open:** billing provider (subscriptions, invoices), feature flags, support tooling.

## Languages and help centre ✅

- The whole product is available in Dutch (default), French and English with an NL | FR | EN switch on every page; the choice is stored in a cookie, otherwise the browser language decides. Dates use nl-BE / fr-BE / en-GB formatting; the demo salon's data is Dutch.
- Help centre at `/help` (and `/app/help` inside the workspace): eight courses with real screenshots per language, animated click-throughs and FAQs, plus a search.
- Each salon chooses its language (Settings › Business profile): the workspace uses it, public salon pages open in it and clients can switch.
- **Open:** French help screenshots (French courses show the English captures until `npm run help:screenshots` is run against the local stack), translated transactional emails.

## Phase 8 — Launch preparation ⏳

- Done so far: automated accessibility audit (axe, WCAG 2.2 AA) on 17 key pages in both languages plus the help centre, security headers, end-to-end flows in Chrome.
- Open: nonce-based CSP, shared rate limiting, Playwright tests in CI, performance review, error monitoring, privacy policy and terms (legal review required), native-speaker review of the French translation, deployment.

## Decisions needed from the product owner

1. **Supabase project** (EU region) for staging/production.
2. **Email provider** for transactional mail (e.g. Postmark, Resend) — also used as Supabase Auth SMTP.
3. **Payment provider** for deposits, webshop and subscriptions (Mollie vs Stripe — both support Bancontact).
4. **Prices** for Basic and Pro (the pricing page says "price coming soon"), and whether an expired trial should keep falling back to Basic (current behaviour) or become read-only.
5. **French** is implemented; decide whether a native speaker reviews it before launch.
6. **Domain** and whether salons get subdomains or custom domains.
7. **Vector logo** (SVG) from the designer.
8. **Gift cards**: confirm with the accountant that revenue on redemption (not on sale) is right, including VAT; which expiry and refund rules salons must follow (NORYX lets each salon set them and enforces none); whether unused balances of expired or cancelled cards need a report.
