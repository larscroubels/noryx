"use client";

import { Check, Pause, Play, Settings2, UserRound } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

import { CategoryIcon, type AppCategory } from "./category-icons";
import styles from "./app-showcase.module.css";
import type { AppShowcaseLabels } from "./app-showcase";

const STEP_MS = 5200;
const CONNECTED: AppCategory[] = ["hair", "nails", "beauty"];
const ALL_CATEGORIES: AppCategory[] = ["hair", "nails", "beauty", "brows", "lashes", "other"];

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The story of the planned app on a phone mockup. It plays while in view (never
 * under reduced motion); choosing a step or pausing hands control to the visitor.
 * Purely presentational: nothing here books, links or validates anything.
 */
export function AppWalkthrough({ labels }: { labels: AppShowcaseLabels }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotion, () => true);
  const phoneRef = useRef<HTMLElement>(null);
  const id = useId();
  const running = playing && inView && !reduced;

  // Watch the phone, not the whole block: stacked on small screens the block can be
  // taller than the viewport, so a ratio of it would never be reached.
  useEffect(() => {
    const element = phoneRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(
          Boolean(entry?.isIntersecting) &&
            (entry!.intersectionRatio >= 0.35 ||
              entry!.intersectionRect.height >= window.innerHeight * 0.5),
        ),
      { threshold: [0, 0.2, 0.35, 0.6, 1] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const choose = (index: number) => {
    setStep(index);
    setPlaying(false);
    // Only for a deliberate choice; autoplay never announces anything.
    setAnnouncement(`${index + 1}/${labels.steps.length}: ${labels.steps[index]!.title}`);
    // Stacked layout: the phone sits above the list, so bring it into view.
    if (!window.matchMedia("(min-width: 64rem)").matches)
      phoneRef.current?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setStep((current) => (current + 1) % labels.steps.length),
      STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, step, labels.steps.length]);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="order-2 lg:order-1">
        <ol aria-label={labels.storyLabel} className="grid gap-2">
          {labels.steps.map((item, index) => {
            const active = index === step;
            return (
              <li key={item.title}>
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  aria-labelledby={`${id}-title-${index}`}
                  aria-describedby={`${id}-text-${index}`}
                  onClick={() => choose(index)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-left transition-colors sm:px-5",
                    active
                      ? "bg-surface shadow-md ring-1 ring-neutral-200/80"
                      : "hover:bg-surface/70",
                  )}
                >
                  <span className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                        active
                          ? "bg-pink-700 text-white"
                          : "bg-surface text-fg-muted ring-1 ring-border-strong",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span
                        id={`${id}-title-${index}`}
                        className={cn("block font-semibold", !active && "text-fg-muted")}
                      >
                        {item.title}
                      </span>
                      {/* Every text stays visible, so autoplay never changes the page height. */}
                      <span id={`${id}-text-${index}`} className="block pt-1 text-sm text-fg-muted">
                        {item.text}
                      </span>
                    </span>
                  </span>
                  {active && running && (
                    <span
                      key={step}
                      aria-hidden="true"
                      className={styles.progress}
                      style={{ animationDuration: `${STEP_MS}ms` }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="mt-4 ml-2 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-fg-muted hover:bg-surface hover:text-fg"
          >
            {playing ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {playing ? labels.pause : labels.play}
          </button>
        )}
      </div>

      <figure ref={phoneRef} className="order-1 scroll-mt-24 lg:order-2">
        <Phone step={step} labels={labels} />
        <figcaption className="mx-auto mt-5 max-w-xs text-center text-xs text-fg-muted">
          {labels.illustration}
        </figcaption>
      </figure>
    </div>
  );
}

/** The phone itself is decorative; the step list carries the same story for assistive tech. */
function Phone({ step, labels }: { step: number; labels: AppShowcaseLabels }) {
  const p = labels.phone;
  const [els, vera, kim] = labels.businesses;
  const tabs = step >= 3;
  const activeTab = step === 5 ? "account" : "hair";
  return (
    <div aria-hidden="true" className={styles.stage}>
      <div className={styles.glow} />
      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.statusBar}>
            <span>{p.time}</span>
            <span className={styles.island} />
            <span className={styles.battery} />
          </div>

          {/* 1 · Account */}
          <Screen active={step === 0}>
            <div className="flex flex-1 flex-col justify-center gap-6 px-6">
              <Logo variant="symbol" height={56} alt="" className="self-center" />
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-rosegold-700 uppercase">
                  {p.welcome}
                </p>
                <p className="mt-2 font-display text-[26px] leading-tight font-semibold">
                  {p.createAccount}
                </p>
              </div>
              <div className="grid gap-3">
                <MockField label={p.name} value={p.nameValue} typing />
                <MockField label={p.email} value={p.emailValue} typing delay />
              </div>
              <span className={cn(styles.button, styles.pressLater)}>{p.continue}</span>
            </div>
          </Screen>

          {/* 2 · Categories */}
          <Screen active={step === 1}>
            <div className="px-5 pt-4">
              <p className="font-display text-[22px] leading-tight font-semibold">
                {p.servicesTitle}
              </p>
              <p className="mt-1 text-[12px] text-fg-muted">{p.servicesHint}</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {ALL_CATEGORIES.map((category, index) => {
                  const chosen = CONNECTED.includes(category);
                  return (
                    <span
                      key={category}
                      className={cn(styles.tile, chosen && styles.tileChosen)}
                      style={{ animationDelay: chosen ? `${500 + index * 450}ms` : undefined }}
                    >
                      <CategoryIcon category={category} className="size-6" />
                      <span className="text-[12px] font-semibold">{p.categories[category]}</span>
                      {chosen && (
                        <span className={styles.tick}>
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </Screen>

          {/* 3 · One code per professional */}
          <Screen active={step === 2}>
            <div className="px-5 pt-4">
              <p className="font-display text-[22px] leading-tight font-semibold">{p.codesTitle}</p>
              <p className="mt-1 text-[12px] text-fg-muted">{p.codesHint}</p>
              <div className="mt-5 grid gap-3">
                {labels.businesses.map((business, index) => (
                  <div
                    key={business.code}
                    className={styles.codeRow}
                    style={{ ["--row" as string]: index } as React.CSSProperties}
                  >
                    <span className={styles.codeIcon}>
                      <CategoryIcon category={CONNECTED[index]!} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] text-fg-muted">{business.category}</span>
                      <span className={styles.codeValue}>
                        <span className={styles.typed}>{business.code}</span>
                      </span>
                      <span className={styles.linkedName}>{business.name}</span>
                    </span>
                    <span className={styles.connectedBadge} title={p.connected}>
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Screen>

          {/* 4 · Els's calendar from the hair tab */}
          <Screen active={step === 3}>
            <BusinessHeader icon="hair" name={els!.name} />
            <div className="px-5">
              <p className="mt-4 text-[12px] font-semibold text-fg-muted">{p.service}</p>
              <p className="mt-1 font-display text-[20px] font-semibold">{p.calendarTitle}</p>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {p.days.map(([weekday, day], index) => (
                  <span key={day} className={cn(styles.day, index === 1 && styles.dayActive)}>
                    <span className="text-[10px] uppercase">{weekday}</span>
                    <span className="text-[15px] font-semibold">{day}</span>
                  </span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {p.slots.map((slot, index) => (
                  <span key={slot} className={cn(styles.slot, index === 3 && styles.slotPicked)}>
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </Screen>

          {/* 6 · Switch Els for Noor */}
          <Screen active={step === 5}>
            <div className="px-5 pt-4">
              <p className="font-display text-[22px] leading-tight font-semibold">
                {p.settingsTitle}
              </p>
              <div className="mt-4 grid gap-2.5">
                <div className={cn(styles.settingRow, styles.swapOut)}>
                  <CategoryIcon category="hair" className="size-5 text-rosegold-700" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold">{els!.name}</span>
                    <span className="text-[11px] text-fg-muted">{els!.category}</span>
                  </span>
                  <span className={styles.labelStack}>
                    <span className={styles.replaceLabel}>{p.replace}</span>
                    <span className={styles.disconnectedLabel}>{p.disconnected}</span>
                  </span>
                </div>
                <div className={cn(styles.settingRow, styles.swapIn)}>
                  <CategoryIcon category="hair" className="size-5 text-rosegold-700" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold">{p.noor.name}</span>
                    <span className="text-[11px] text-fg-muted">
                      {p.newCode}:{" "}
                      <span className="font-mono font-semibold whitespace-nowrap">
                        {p.noor.code}
                      </span>
                    </span>
                  </span>
                  <span className={styles.connectedBadgeStatic} title={p.connected}>
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                </div>
                {[vera!, kim!].map((business, index) => (
                  <div key={business.code} className={styles.settingRow}>
                    <CategoryIcon
                      category={CONNECTED[index + 1]!}
                      className="size-5 text-rosegold-700"
                    />
                    <span className="flex-1">
                      <span className="block text-[13px] font-semibold">{business.name}</span>
                      <span className="text-[11px] text-fg-muted">{business.category}</span>
                    </span>
                    <Settings2 className="size-4 text-fg-subtle" />
                  </div>
                ))}
              </div>
            </div>
          </Screen>

          {/* 5 · History per professional */}
          <Screen active={step === 4}>
            <BusinessHeader icon="hair" name={els!.name} />
            <div className="px-5">
              <p className="mt-4 font-display text-[20px] font-semibold">{p.historyTitle}</p>
              <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">
                {p.history.map((visit, index) => (
                  <li
                    key={`${visit.date}-${visit.time}`}
                    className={styles.historyRow}
                    style={{ animationDelay: `${200 + index * 160}ms` }}
                  >
                    <span className="text-center">
                      <span className="block text-[13px] font-semibold">{visit.date}</span>
                      <span className="block text-[11px] text-fg-muted">{visit.time}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">
                        {visit.service}
                      </span>
                      <span className={styles.statusPill}>
                        <Check className="size-2.5" strokeWidth={3} /> {p.completed}
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums">{visit.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Screen>

          {/* Bottom bar: one icon per connected professional */}
          <div className={cn(styles.tabBar, tabs && styles.tabBarShown)}>
            {labels.businesses.map((business, index) => {
              const category = CONNECTED[index]!;
              const name =
                step === 5 && index === 0 ? p.noor.name.split(" ").at(-1)! : business.short;
              const active = activeTab === category;
              return (
                <span key={business.code} className={cn(styles.tab, active && styles.tabActive)}>
                  {active && step === 3 && <span className={styles.tap} />}
                  <CategoryIcon category={category} className="size-[22px]" />
                  <span>{name}</span>
                </span>
              );
            })}
            <span className={cn(styles.tab, activeTab === "account" && styles.tabActive)}>
              <UserRound className="size-[22px]" strokeWidth={1.5} />
              <span>{p.nameValue.split(" ")[0]}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating detail beside the phone: each professional's code is their own */}
      <div className={cn(styles.floatCard, styles.floatLeft)} data-show={step === 2 || undefined}>
        <span className="text-[11px] text-fg-muted">{labels.codeLabel}</span>
        <span className="font-mono text-sm font-semibold">{vera!.code}</span>
      </div>
    </div>
  );
}

function Screen({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.view} data-active={active || undefined}>
      {children}
    </div>
  );
}

function MockField({
  label,
  value,
  typing,
  delay,
}: {
  label: string;
  value: string;
  typing?: boolean;
  delay?: boolean;
}) {
  return (
    <span className={styles.field}>
      <span className="text-[10px] font-semibold text-fg-muted">{label}</span>
      <span
        className={cn("text-[13px]", typing && styles.fieldTyping, delay && styles.fieldTypingLate)}
      >
        {value}
      </span>
    </span>
  );
}

function BusinessHeader({ icon, name }: { icon: AppCategory; name: string }) {
  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl bg-surface-warm px-3.5 py-3 ring-1 ring-champagne-200">
      <span className="flex size-9 items-center justify-center rounded-full bg-surface text-rosegold-700 ring-1 ring-champagne-200">
        <CategoryIcon category={icon} className="size-5" />
      </span>
      <span className="text-[14px] font-semibold">{name}</span>
    </div>
  );
}
