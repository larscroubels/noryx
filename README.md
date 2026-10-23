# NORYX

The all-in-one business platform for hair salons, barbers, beauty salons, nail, lash & brow studios and independent beauty professionals.

This repository contains the NORYX web application: the public website, the salon workspace (owner and staff), the public booking pages and the platform administration area. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for what is built and what comes next.

| Area                    | URL (local)                             | Status                                                                                    |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Marketing site          | http://localhost:3000                   | Live                                                                                      |
| Sign up / sign in       | http://localhost:3000/signup · `/login` | Live (email verification, password reset, email change)                                   |
| Guided onboarding       | http://localhost:3000/onboarding        | Live                                                                                      |
| Salon workspace         | http://localhost:3000/app               | Overview, calendar, customers, services, staff, products, orders, finance, team, settings |
| Public booking page     | http://localhost:3000/atelier-noor      | Live (demo salon): booking flow, click-and-collect shop, self-service cancellation        |
| Platform administration | http://localhost:3000/admin             | Statistics, business status, plans, audit log                                             |
| Design system           | http://localhost:3000/design-system     | Living reference of tokens and components                                                 |

## Quick start (local)

Requirements: Node.js 24+ (26 used in development), Docker (Colima works — no Docker Desktop needed) and the Supabase CLI.

```bash
# one-time tooling on macOS
brew install node colima docker supabase/tap/supabase

colima start --cpu 4 --memory 6 --vm-type vz   # Docker runtime
npm ci                                          # dependencies
npm run db:start                                # local Supabase (Postgres, Auth, Storage, Studio, Mailpit)
npm run db:reset                                # apply migrations + load demo data
supabase status -o env                          # copy API_URL / PUBLISHABLE_KEY / SECRET_KEY into .env.local
npm run dev                                     # http://localhost:3000
```

`.env.local` needs the values listed in [`.env.example`](.env.example). For local development they come from `supabase status`.

### Demo logins (local only)

`npm run db:reset` loads a fictional salon, **Atelier Noor**, from [`supabase/seed.sql`](supabase/seed.sql):

| Email              | Password        | Role                                         |
| ------------------ | --------------- | -------------------------------------------- |
| `owner@noryx.test` | `NoryxDemo2026` | Salon owner — full access                    |
| `staff@noryx.test` | `NoryxDemo2026` | Staff member — own calendar and clients only |
| `admin@noryx.test` | `NoryxDemo2026` | NORYX platform administrator                 |

Emails sent by local Supabase Auth (sign-up confirmation, password reset) are captured by **Mailpit** at http://127.0.0.1:54324. Supabase Studio runs at http://127.0.0.1:54323.

## Scripts

| Command                                     | What it does                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`                               | Next.js dev server                                                         |
| `npm run build`                             | Production build                                                           |
| `npm run check`                             | Lint + typecheck + all tests                                               |
| `npm run test`                              | Unit tests and database tests (RLS, booking rules) via in-process Postgres |
| `npm run lint` / `typecheck` / `format`     | Individual quality checks                                                  |
| `npm run db:start` / `db:stop` / `db:reset` | Local Supabase lifecycle                                                   |
| `npm run db:types`                          | Regenerate `src/types/database.ts` from the local schema                   |
| `npm run brand:assets`                      | Regenerate logo crops, favicons and app icons from `brand/source`          |
| `npm run help:screenshots`                  | Recapture help-centre screenshots and click targets from the demo data     |

Database tests run every migration inside [PGlite](https://pglite.dev) (Postgres compiled to WebAssembly) with a small Supabase shim, so tenant isolation and booking rules are tested without Docker.

## Project structure

```
brand/source/            Official logo artwork (untouched original)
docs/                    Product brief, architecture, design system, roadmap
public/brand/            Logo lockup, wordmark, symbol and app icons (generated)
scripts/                 Brand asset pipeline, help-centre screenshot capture
src/app/                 Routes (App Router)
  (marketing)/           Public website
  (auth)/                Sign-in, sign-up, password reset
  onboarding/            Guided business setup
  app/                   Salon workspace (owner + staff, permission-aware)
  [slug]/                Public business page and booking flow
  admin/                 Platform administration
  design-system/         Living design-system reference
src/components/ui/       Design-system components (buttons, forms, dialogs, …)
src/content/help/        Help-centre courses (nl, en) and screenshot click targets
src/i18n/                Languages: config, dictionaries (nl, en), server and client helpers
src/lib/                 Domain logic: auth & permissions, booking engine, time zones, validation
src/styles/tokens.css    Design tokens (single source of truth)
supabase/migrations/     Database schema, RLS policies and functions
supabase/templates/      Branded auth emails
tests/db/                Database tests (tenant isolation, roles, booking)
```

## Going to production

1. Create a Supabase project in an **EU region** and apply the migrations: `supabase link --project-ref <ref> && supabase db push`. Do **not** run `seed.sql` in production.
2. In the Supabase dashboard: set the Site URL and redirect URLs to your domain, enable email confirmation, paste the templates from `supabase/templates/`, and configure a custom SMTP provider (Supabase's built-in mailer is rate-limited and not for production).
3. Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` in your hosting provider (e.g. Vercel). The secret key must never be exposed to the browser. Optionally set `ANTHROPIC_API_KEY` to switch on the AI assistant on the website.
4. Create the first platform administrator manually: `insert into public.platform_admins (user_id) values ('<auth user id>');`

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the security model and design decisions.
