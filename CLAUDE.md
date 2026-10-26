# NORYX — notes for AI coding sessions

@AGENTS.md

Requirements: `docs/PRODUCT_BRIEF.md`. Progress and open work: `docs/ROADMAP.md`. Architecture and security model: `docs/ARCHITECTURE.md`. Design rules: `docs/DESIGN_SYSTEM.md`.

## Commands

- `npm run dev` — needs local Supabase running (`colima start`, then `npm run db:start`).
- `npm run check` — lint + typecheck + tests. Run before finishing any change.
- NORYX app (`mobile/`, Expo): `npm --prefix mobile run check` (lint + typecheck + jest), `npm --prefix mobile start` (Expo Go). It imports pure web code via `@/…` (`../src`); its own code is `~/…`. Never import server-only modules from the app.
- `npm run db:reset` — re-applies migrations and the demo seed; then `npm run db:types` after schema changes.
- New migrations go in `supabase/migrations/` (timestamped). Apply locally with `supabase migration up --local`.

## Conventions

- Authorisation lives in the database (RLS + SECURITY DEFINER helpers with `set search_path = ''`). Every new table: `business_id`, RLS enabled, explicit grants, composite FKs `(business_id, x_id)`, and tests in `tests/db/`.
- Permission keys are mirrored in `src/lib/auth/permissions.ts` and `public.permissions`; keep both in sync (a test enforces it).
- Server actions: validate with Zod (`src/lib/validation`), call `authorize()` from `src/lib/auth/session.ts`, return `ActionState` from `src/lib/actions.ts`, map DB errors with `databaseErrorMessage`.
- Times: UTC instants, local dates as `YYYY-MM-DD`, weekly hours as minutes after midnight (ISO weekday). Use `src/lib/time.ts` and `src/lib/format.ts`. Money is integer cents.
- UI: only design tokens (Tailwind's default palette is disabled); components from `src/components/ui`; status never by colour alone; rose gold and pink ≤ 400 are decorative only.
- Never claim an email, payment or integration happened unless it did (see `src/lib/notifications.ts`).

## Environment gotcha

The project lives in an iCloud-synced Desktop folder. `node_modules` and `.next` carry the `com.apple.fileprovider.ignore#P` attribute so iCloud doesn't sync or evict them. If builds become extremely slow, check for evicted files with `find node_modules -flags +dataless | head` and reinstall after re-creating the folder with that attribute.
