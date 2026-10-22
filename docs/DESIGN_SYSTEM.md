# NORYX design system

Live reference: http://localhost:3000/design-system

**Bright, warm, luxurious and calm.** White dominates; warm ivory and champagne add warmth; rose gold adds small elegant details; pink is reserved for the primary action and selective emphasis. There are no dark sections.

## Brand assets

The current logo (v4, supplied 21 October 2026) is a stacked lockup: an X monogram — a pink diagonal and left bar with two black facets — above the NORYX wordmark (black letters, pink X).

- `brand/original/NORYX-logo-v4-mockup.png` — the file as supplied (a relief mock-up on cream with red corners, not transparent).
- `brand/source/NORYX-logo-v4-transparent.png` — the transparent master used by the app, cut out of the mock-up locally with the BiRefNet background-removal model (alpha below 10 cleared as noise). No shapes were redrawn.
- `brand/archive/` — previous logos (v1–v3) and their sources.

`scripts/generate-brand-assets.mjs` derives every variant from the master by **cropping and resizing only**:

| Asset    | File                                                                        | Use                                                               |
| -------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Lockup   | `public/brand/noryx-lockup.png`                                             | Hero and brand moments (≥ 96px tall)                              |
| Wordmark | `public/brand/noryx-wordmark.png`                                           | Headers (≥ 16px tall)                                             |
| Symbol   | `public/brand/noryx-symbol.png`                                             | Compact navigation, app icon                                      |
| Icons    | `src/app/icon.png`, `favicon.ico`, `apple-icon.png`, `public/brand/icons/*` | Favicon, iOS home screen (ivory background), PWA (incl. maskable) |
| Social   | `src/app/opengraph-image.png`                                               | Link previews                                                     |

Use the `<Logo variant height />` component. The master is ~800 px wide; ask the designer for a vector (SVG) or a larger transparent PNG for print and very large displays.

## Colour

Defined once in `src/styles/tokens.css` (Tailwind's default palette is removed). Colours follow the logo: its pink is `#E0738A` (`pink-400`, decorative only because it is too light for text) and its wordmark black. Text and primary buttons use the deeper `pink-700` (`#B83D5D`) from the same hue so they meet WCAG AA.

| Role              | Token                                        | Notes                                     |
| ----------------- | -------------------------------------------- | ----------------------------------------- |
| Page / cards      | `white`, `surface`                           | Dominant surface                          |
| Sections, sidebar | `ivory` (#FBF8F5), `champagne-50/100/200`    | Warmth                                    |
| Primary action    | `pink-700` (#B83D5D), hover `800`            | 5.4:1 with white text                     |
| Rose-gold accent  | `rosegold-400` (#C99A85)                     | **Decorative only** (2.5:1 on white)      |
| Accent text       | `rosegold-600+` (`fg-accent` = 700)          | Safe for text                             |
| Text              | `neutral-900` (#292626), muted `neutral-600` | `fg-muted` is the lightest body-text grey |
| Control borders   | `neutral-450`                                | Meets 3:1 non-text contrast               |
| Focus ring        | `rosegold-600` outline, 2px, offset 2px      | Visible on all light surfaces             |
| Status            | `success`, `warning`, `danger`, `info`       | Always with icon/label                    |

`src/styles/tokens.test.ts` checks every approved text/background pair against WCAG 2.2 AA.

## Typography

- **Cormorant Garamond** (500/600, italic for accent words) — display headings and page titles only. It uses old-style figures, so never use it for numbers in data.
- **Manrope** — all UI and body text; `tabular-nums` for times, prices and statistics.
- Display scale tokens: `text-display-sm/md/lg/xl`; `eyebrow` utility for small uppercase labels.

## Shape, depth, motion, layout

- Radius: `sm` 6 · `md` 10 (buttons, inputs) · `lg` 14 · `xl` 20 (cards) · `2xl` 28 (marketing panels).
- Shadows: warm-tinted `xs`–`xl`; cards use a soft shadow plus a faint border instead of heavy outlines.
- Motion: 120–220ms, purposeful only; everything is disabled under `prefers-reduced-motion`.
- Demonstration motion (the landing-page hero and the help-centre screenshots) loops a cursor or finger through real UI. It only plays while visible and becomes a static highlight under `prefers-reduced-motion`.
- Layout: `container-page` utility (max 80rem, gutters 16/24/32px). Breakpoints: Tailwind defaults (640/768/1024/1280/1536).

## Components (`src/components/ui`)

Button (primary, secondary, soft, ghost, link, danger · sm/md/lg/icon · loading), Field (label, hint, error with icon, optional/required) + Input/Textarea/Select (native), Checkbox, Switch, RadioGroup, Card, Badge, Alert, Dialog, DropdownMenu, Tooltip, Toast, Tabs, Table, Avatar, Spinner, Skeleton, EmptyState, ErrorState. Layout: AppShell pieces in `src/components/layout`, PageHeader. Domain: `AppointmentStatusBadge`.

Rules: one primary (pink) button per view; status never by colour alone; tooltips never hold essential information; validation messages are text + icon; touch targets ≥ 40px (44px in the booking flow).
