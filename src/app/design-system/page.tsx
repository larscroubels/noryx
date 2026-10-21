import { CalendarPlus, Plus, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Logo } from "@/components/brand/logo";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { dictionaries } from "@/i18n/dictionaries";

import { FormDemo, OverlayDemo, TabsDemo } from "./interactive-demos";

export const metadata: Metadata = { title: "Design system", robots: { index: false } };

const SWATCHES: {
  group: string;
  note: string;
  colors: { name: string; hex: string; text?: boolean }[];
}[] = [
  {
    group: "Surfaces",
    note: "White dominates. Ivory and champagne add warmth to sections and highlights.",
    colors: [
      { name: "white", hex: "#FFFFFF" },
      { name: "ivory", hex: "#FBF8F5" },
      { name: "champagne-50", hex: "#F9F3EE" },
      { name: "champagne-100", hex: "#F4E9DF" },
      { name: "champagne-200", hex: "#EAD8C8" },
    ],
  },
  {
    group: "Rose gold",
    note: "Sampled from the logo. 400 and lighter are decorative only; 600+ is safe for text.",
    colors: [
      { name: "rosegold-100", hex: "#F6E8E0" },
      { name: "rosegold-300", hex: "#DFB7A3" },
      { name: "rosegold-400", hex: "#C99A85" },
      { name: "rosegold-600", hex: "#92644F", text: true },
      { name: "rosegold-800", hex: "#5B3B2E", text: true },
    ],
  },
  {
    group: "Pink",
    note: "The signature accent: primary actions and selective emphasis.",
    colors: [
      { name: "pink-50", hex: "#fdf2f4" },
      { name: "pink-200", hex: "#f6c9d3" },
      { name: "pink-400", hex: "#e0738a" },
      { name: "pink-700", hex: "#b83d5d", text: true },
      { name: "pink-900", hex: "#7a2238", text: true },
    ],
  },
  {
    group: "Neutrals",
    note: "Warm greys for text and borders. fg-muted (600) is the lightest body-text grey.",
    colors: [
      { name: "neutral-200", hex: "#EAE4E0" },
      { name: "neutral-450", hex: "#958B86" },
      { name: "neutral-600", hex: "#6E6764", text: true },
      { name: "neutral-800", hex: "#3A3534", text: true },
      { name: "neutral-900", hex: "#292626", text: true },
    ],
  },
  {
    group: "Status",
    note: "Always paired with an icon or label, never colour alone.",
    colors: [
      { name: "success-600", hex: "#1F7A4B", text: true },
      { name: "warning-600", hex: "#A86A05" },
      { name: "danger-600", hex: "#C0352B", text: true },
      { name: "info-600", hex: "#3A6194", text: true },
    ],
  },
];

const SECTIONS = [
  "Brand",
  "Colour",
  "Typography",
  "Buttons",
  "Forms",
  "Badges",
  "Feedback",
  "Cards & tables",
  "Overlays",
  "Navigation",
  "Tokens",
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border py-12"
    >
      <h2 id={`${id}-title`} className="font-display text-display-sm font-semibold">
        {title}
      </h2>
      {description && <p className="mt-2 max-w-2xl text-fg-muted">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  const statuses: AppointmentStatus[] = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ];
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-surface-subtle">
        <div className="container-page py-12 sm:py-16">
          <Logo variant="wordmark" height={24} priority />
          <h1 className="mt-8 font-display text-display-lg font-semibold">Design system</h1>
          <p className="mt-3 max-w-2xl text-lg text-fg-muted">
            The shared foundation for every NORYX experience: bright, warm and luxurious, with
            rose-gold details and pink reserved for what matters most. Tokens live in{" "}
            <code className="text-sm">src/styles/tokens.css</code>; components in{" "}
            <code className="text-sm">src/components/ui</code>.
          </p>
          <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section}
                href={`#${section.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-fg-muted hover:text-fg"
              >
                {section}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="container-page pb-24">
        <Section
          id="brand"
          title="Brand"
          description="Official artwork (logo v2), cropped from the transparent master in brand/source — never redrawn. Use the wordmark in headers, the symbol for compact UI and icons, the lockup for brand moments."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="flex flex-col items-center justify-center gap-4 p-8">
              <Logo variant="lockup" height={140} />
              <p className="text-sm text-fg-muted">Lockup · min. 96px tall</p>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-4 p-8">
              <Logo variant="wordmark" height={32} />
              <p className="text-sm text-fg-muted">Wordmark · min. 20px tall</p>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-4 p-8">
              <Logo variant="symbol" height={88} />
              <p className="text-sm text-fg-muted">Symbol · app icon & favicon</p>
            </Card>
          </div>
        </Section>

        <Section
          id="colour"
          title="Colour"
          description="Contrast is verified automatically (src/styles/tokens.test.ts). Swatches marked Aa are approved for text on white."
        >
          <div className="grid gap-8">
            {SWATCHES.map((group) => (
              <div key={group.group}>
                <h3 className="font-semibold">{group.group}</h3>
                <p className="mt-1 text-sm text-fg-muted">{group.note}</p>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {group.colors.map((color) => (
                    <li key={color.name} className="overflow-hidden rounded-lg ring-1 ring-border">
                      <div className="flex h-16 items-end p-2" style={{ background: color.hex }}>
                        {color.text && (
                          <span
                            className="rounded bg-white px-1.5 text-xs font-semibold"
                            style={{ color: color.hex }}
                          >
                            Aa
                          </span>
                        )}
                      </div>
                      <div className="bg-surface px-3 py-2 text-xs">
                        <p className="font-semibold">{color.name}</p>
                        <p className="text-fg-muted uppercase">{color.hex}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography"
          description="Cormorant Garamond for display moments; Manrope for everything you read and use. Numbers use tabular figures in data."
        >
          <div className="grid gap-6">
            <p className="font-display text-display-xl font-semibold">Beautifully organised</p>
            <p className="font-display text-display-lg font-semibold">Display large</p>
            <p className="font-display text-display-md font-semibold">Display medium</p>
            <p className="font-display text-display-sm font-semibold">
              Display small — page titles
            </p>
            <p className="eyebrow">Eyebrow label</p>
            <p className="text-xl font-semibold">Heading · Manrope 20 semibold</p>
            <p className="text-base">
              Body · Manrope 16 — clear, friendly and highly legible on every screen.
            </p>
            <p className="text-sm text-fg-muted">
              Secondary · Manrope 14 in fg-muted for supporting information.
            </p>
            <p className="text-sm font-semibold tabular-nums">
              € 1.234,50 · 09:30–10:45 · 21/10/2026
            </p>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="Pink is reserved for the primary action on a screen. Every button has hover, focus, disabled and loading states."
        >
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="danger">Delete</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="secondary" aria-label="Add">
                <Plus aria-hidden="true" />
              </Button>
              <Button>
                <CalendarPlus aria-hidden="true" /> With icon
              </Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section
          id="forms"
          title="Forms"
          description="Labels are always visible, validation messages carry an icon and text, and control borders meet 3:1 contrast."
        >
          <Card>
            <CardContent>
              <FormDemo />
            </CardContent>
          </Card>
        </Section>

        <Section
          id="badges"
          title="Badges & status"
          description="Statuses combine colour, icon and label."
        >
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "neutral",
                  "brand",
                  "gold",
                  "success",
                  "warning",
                  "danger",
                  "info",
                  "outline",
                ] as const
              ).map((tone) => (
                <Badge key={tone} tone={tone}>
                  {tone}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <AppointmentStatusBadge key={status} status={status} />
              ))}
            </div>
            <p className="text-sm text-fg-muted">
              Appointment statuses: {statuses.map((s) => dictionaries.en.common.appointmentStatus[s]).join(", ")}.
            </p>
          </div>
        </Section>

        <Section id="feedback" title="Feedback, loading, empty & error states">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="grid gap-3">
              <Alert tone="info" title="Information">
                Supporting context for a section or form.
              </Alert>
              <Alert tone="success" title="Saved">
                Your changes are live.
              </Alert>
              <Alert tone="warning" title="Check this">
                Online booking is turned off.
              </Alert>
              <Alert tone="danger" title="Something went wrong">
                Please try again.
              </Alert>
            </div>
            <div className="grid gap-5">
              <Card className="flex items-center gap-4 p-5">
                <Spinner className="size-5 text-pink-700" label="Loading" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
              <Card>
                <EmptyState
                  icon={<Sparkles />}
                  title="No appointments today"
                  description="New online bookings appear here automatically."
                  action={<Button variant="secondary">Add appointment</Button>}
                />
              </Card>
              <Card>
                <ErrorState
                  description="We couldn't load this page."
                  action={<Button variant="secondary">Try again</Button>}
                />
              </Card>
            </div>
          </div>
        </Section>

        <Section
          id="cards-tables"
          title="Cards & tables"
          description="Soft warm shadows instead of heavy borders. Tables scroll inside their card on small screens."
        >
          <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Card title</CardTitle>
                  <CardDescription>Supporting description</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-fg-muted">
                Card content area with comfortable padding.
              </CardContent>
              <CardFooter>
                <Button variant="ghost">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Sofie Janssens", "Balayage", "confirmed", "€ 120,00"],
                    ["Lucas Dubois", "Men's haircut", "completed", "€ 32,00"],
                    ["Emma Willems", "Gel manicure", "pending", "€ 45,00"],
                  ].map(([name, service, status, price]) => (
                    <TableRow key={name}>
                      <TableCell>
                        <span className="flex items-center gap-3 font-semibold">
                          <Avatar name={name!} size="sm" /> {name}
                        </span>
                      </TableCell>
                      <TableCell className="text-fg-muted">{service}</TableCell>
                      <TableCell>
                        <AppointmentStatusBadge status={status as AppointmentStatus} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
          <p className="mt-3 text-xs text-fg-muted">Example content for illustration.</p>
        </Section>

        <Section
          id="overlays"
          title="Dialogs, menus, tooltips & toasts"
          description="Built on Radix primitives: focus is trapped and restored, Escape closes, and screen readers get proper roles."
        >
          <OverlayDemo />
        </Section>

        <Section id="navigation" title="Navigation">
          <TabsDemo />
        </Section>

        <Section id="tokens" title="Radius, shadow, spacing & breakpoints">
          <div className="grid gap-8">
            <div className="flex flex-wrap gap-4">
              {(
                [
                  "rounded-sm",
                  "rounded-md",
                  "rounded-lg",
                  "rounded-xl",
                  "rounded-2xl",
                  "rounded-full",
                ] as const
              ).map((radius) => (
                <div
                  key={radius}
                  className={`flex size-24 items-end bg-champagne-100 p-2 text-xs font-semibold ${radius}`}
                >
                  {radius.replace("rounded-", "")}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-6">
              {(["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"] as const).map(
                (shadow) => (
                  <div
                    key={shadow}
                    className={`flex size-28 items-end rounded-xl bg-surface p-3 text-xs font-semibold ${shadow}`}
                  >
                    {shadow.replace("shadow-", "")}
                  </div>
                ),
              )}
            </div>
            <p className="text-sm text-fg-muted">
              Spacing follows a 4px grid (Tailwind scale). Page gutters: 16px on phones, 24px from
              640px, 32px from 1024px. Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536.
              Motion stays under 250ms and is disabled when reduced motion is requested.
            </p>
          </div>
        </Section>
      </main>
    </div>
  );
}
