#!/usr/bin/env node
/**
 * Captures the help-centre screenshots (public/help/<locale>/*.webp) and the animated
 * cursor targets (src/content/help/hotspots.json) from the local demo workspace.
 *
 * Needs the local stack with fresh demo data and a running dev server, plus Google Chrome:
 *
 *   npm run db:reset && npm run dev
 *   npm run help:screenshots            # every screenshot
 *   npm run help:screenshots -- team    # only the named ones
 *
 * It signs in as the demo owner and admin, and creates a business for the demo admin to
 * capture the onboarding, so run `npm run db:reset` again afterwards. The sign-in rate
 * limit (10 per 15 minutes) resets when the dev server restarts.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";
import sharp from "sharp";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "http://localhost:3000";
const LOCALES = ["nl", "en"];
const T = {
  nl: {
    email: "E-mail",
    password: "Wachtwoord",
    signIn: "Inloggen",
    continue: "Verder",
    payment: "Betaling",
    hours: "Werkuren",
    business: "Naam van je zaak",
    type: "Soort zaak",
    create: "Mijn zaak aanmaken",
  },
  en: {
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    continue: "Continue",
    payment: "Payment",
    hours: "Working hours",
    business: "Business name",
    type: "Type of business",
    create: "Create my business",
  },
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const sessions = {};
async function context(locale, kind) {
  const key = `${locale}-${kind}`;
  if (sessions[key]) return sessions[key];
  const mobile = kind === "mobile";
  const ctx = await browser.newContext({
    locale: locale === "nl" ? "nl-BE" : "en-GB",
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1,
  });
  await ctx.addCookies([{ name: "noryx_locale", value: locale, url: BASE }]);
  const page = await ctx.newPage();
  if (kind === "owner" || kind === "admin") {
    await page.goto(`${BASE}/login`);
    await page
      .getByLabel(T[locale].email)
      .fill(kind === "owner" ? "owner@noryx.test" : "admin@noryx.test");
    await page.getByLabel(T[locale].password).fill("NoryxDemo2026");
    await page.getByRole("button", { name: T[locale].signIn }).click();
    await page.waitForURL(/\/(app|onboarding|admin)/, { timeout: 60000 });
  }
  sessions[key] = page;
  return page;
}

const hotspotsFile = path.join(project, "src/content/help/hotspots.json");
const hotspots = JSON.parse(await readFile(hotspotsFile, "utf8").catch(() => "{}"));

/** Records where the animated cursor should click, as percentages of the screenshot. */
async function measure(page, locale, name, targets) {
  const viewport = page.viewportSize();
  const boxes = [];
  for (const target of targets) {
    const locator = (
      typeof target === "string" ? page.locator(target) : target(page, locale)
    ).first();
    if (!(await locator.count())) continue;
    const box = await locator.boundingBox();
    if (!box) continue;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    if (cx < 0 || cy < 0 || cx > viewport.width || cy > viewport.height) continue;
    const pct = (value, total) => Math.round((value / total) * 10000) / 100;
    boxes.push({
      x: pct(box.x, viewport.width),
      y: pct(box.y, viewport.height),
      w: pct(box.width, viewport.width),
      h: pct(box.height, viewport.height),
    });
  }
  if (boxes.length === 0) throw new Error(`No visible hotspot for ${locale}/${name}`);
  (hotspots[locale] ??= {})[name] = boxes;
}

async function save(page, locale, name, targets) {
  await page.addStyleTag({
    content: "nextjs-portal{display:none!important} *{caret-color:transparent!important}",
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await measure(page, locale, name, targets);
  const png = await page.screenshot({ fullPage: false });
  const dir = path.join(project, "public", "help", locale);
  await mkdir(dir, { recursive: true });
  const info = await sharp(png)
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(dir, `${name}.webp`));
  console.log(
    `${locale}/${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} kB`,
  );
}

async function scrollTo(page, locator) {
  await locator.first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -96));
}

const go = (page, url) => page.goto(BASE + url, { waitUntil: "networkidle" });

const timeButton = (p) => p.getByRole("button", { name: /^\d{2}:\d{2}$/ }).nth(2);
const firstAppointment = 'a[href^="/app/appointments/"]:not([href*="/appointments/new"])';

/** The elements each step's animated cursor visits, in order. */
const TARGETS = {
  signup: ['input[name="fullName"]', 'input[name="email"]', 'button[type="submit"]'],
  "onboarding-business": [
    'input[name="name"]',
    'select[name="businessType"]',
    'button[type="submit"]',
  ],
  "onboarding-hours": ["#day-6-open", 'input[name="day-2-start"]', 'button[type="submit"]'],
  overview: ['a[href^="/app/calendar?date="]', 'header a[target="_blank"]'],
  "calendar-week": ['a[href*="view=week"]', firstAppointment],
  "new-appointment": ['select[name="serviceId"]', 'input[name="time"]', 'button[type="submit"]'],
  "appointment-detail": ['form:has(input[name="status"]) button[type="submit"]'],
  "appointment-payment": [
    'input[name="amount"]',
    'select[name="method"]',
    'form:has(input[name="amount"]) button[type="submit"]',
  ],
  requests: [firstAppointment],
  "public-page": ['header a[href$="/book"]', 'a[href*="/book?service="]'],
  "booking-time": ['ul button[aria-pressed="true"]', timeButton],
  "settings-booking": [
    'select[name="bookingMinNoticeMinutes"]',
    "#bookingRequiresApproval",
    '#booking button[type="submit"]',
  ],
  settings: ['a[href="#branding"]', 'input[name="description"], textarea[name="description"]'],
  customers: [
    "#customer-search",
    'a[href^="/app/customers/"]:not([href*="new"]):not([href*="export"])',
  ],
  "customer-detail": ['a[href^="/app/appointments/new?customer="]', 'textarea[name="body"]'],
  services: ['a[href="/app/services/new"]', 'a[href^="/app/services/"]:not([href$="/new"])'],
  "service-form": ['[id^="staff-"]', 'button[type="submit"]'],
  "staff-detail": ['#hours input[type="time"]', '#hours button[type="submit"]'],
  team: ['input[name="email"]', 'form:has(input[name="email"]) button[type="submit"]'],
  products: ['a[href="/app/products?filter=low"]', 'a[href="/app/products/new"]'],
  "product-detail": [
    'select[name="reason"]',
    'input[name="quantity"]',
    'form:has(input[name="productId"]) button[type="submit"]',
  ],
  "order-detail": [
    'form:has(input[name="status"]) button[type="submit"]',
    'button[name="paymentStatus"]',
  ],
  finance: ["#from", 'a[href*="type=payments"]'],
  account: ['input[name="fullName"]', 'input[name="password"]'],
};

const SHOTS = [
  ["signup", "guest", (p) => go(p, "/signup")],
  ["onboarding-business", "admin", (p) => go(p, "/onboarding")],
  ["overview", "owner", (p) => go(p, "/app")],
  ["calendar-week", "owner", (p) => go(p, "/app/calendar?view=week")],
  ["new-appointment", "owner", (p) => go(p, "/app/appointments/new")],
  [
    "appointment-detail",
    "owner",
    async (p) => {
      await go(p, "/app/calendar");
      const hrefs = await p
        .locator('a[href^="/app/appointments/"]:not([href*="/appointments/new"])')
        .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute("href")))]);
      // Prefer an appointment that still shows the payment form.
      for (const href of hrefs) {
        await go(p, href);
        if (await p.locator('input[name="amount"]').count()) break;
      }
    },
  ],
  [
    "appointment-payment",
    "owner",
    async (p, locale) => {
      await scrollTo(p, p.getByRole("heading", { name: T[locale].payment, exact: true }));
    },
  ],
  ["requests", "owner", (p) => go(p, "/app/calendar?status=pending")],
  ["public-page", "guest", (p) => go(p, "/atelier-noor")],
  [
    "booking-time",
    "mobile",
    async (p, locale) => {
      await go(p, "/atelier-noor/book");
      await p.locator("section button").first().click();
      await p.getByRole("button", { name: T[locale].continue, exact: true }).click();
      await p
        .getByRole("button", { name: /^\d{2}:\d{2}$/ })
        .first()
        .waitFor({ timeout: 20000 });
      await scrollTo(p, p.getByRole("heading", { level: 2 }));
    },
  ],
  [
    "settings-booking",
    "owner",
    async (p) => {
      await go(p, "/app/settings");
      await scrollTo(p, p.locator("#booking"));
    },
  ],
  ["settings", "owner", (p) => go(p, "/app/settings")],
  ["customers", "owner", (p) => go(p, "/app/customers?sort=name")],
  [
    "customer-detail",
    "owner",
    async (p) => {
      await go(p, "/app/customers?q=Janssens");
      const href = await p
        .locator('a[href^="/app/customers/"]')
        .filter({ hasText: "Sofie" })
        .first()
        .getAttribute("href");
      await go(p, href);
    },
  ],
  ["services", "owner", (p) => go(p, "/app/services")],
  [
    "service-form",
    "owner",
    async (p) => {
      const href = await p
        .locator('a[href^="/app/services/"]:not([href$="/new"])')
        .first()
        .getAttribute("href");
      await go(p, href);
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    },
  ],
  [
    "staff-detail",
    "owner",
    async (p) => {
      await go(p, "/app/staff");
      const href = await p
        .locator('a[href^="/app/staff/"]')
        .filter({ hasText: "Lena" })
        .first()
        .getAttribute("href");
      await go(p, href);
      await scrollTo(p, p.locator("#hours"));
    },
  ],
  [
    "team",
    "owner",
    async (p) => {
      await go(p, "/app/team");
      await scrollTo(p, p.locator('form:has(input[name="email"])'));
    },
  ],
  ["products", "owner", (p) => go(p, "/app/products")],
  [
    "product-detail",
    "owner",
    async (p) => {
      const href = await p
        .locator('a[href^="/app/products/"]:not([href$="/new"])')
        .filter({ hasText: /masker|mask/i })
        .first()
        .getAttribute("href");
      await go(p, href);
    },
  ],
  [
    "order-detail",
    "owner",
    async (p) => {
      await go(p, "/app/orders");
      const href = await p.locator('a[href^="/app/orders/"]').first().getAttribute("href");
      await go(p, href);
    },
  ],
  ["finance", "owner", (p) => go(p, "/app/finance")],
  ["account", "owner", (p) => go(p, "/app/account")],
  // Creates a business for the demo admin, so it runs after the step-1 capture above.
  [
    "onboarding-hours",
    "admin",
    async (p, locale) => {
      await go(p, "/onboarding");
      if (await p.getByLabel(T[locale].business).count()) {
        await p.getByLabel(T[locale].business).fill("Studio Lumière");
        await p.getByLabel(T[locale].type).selectOption("hair_salon");
        await p.getByRole("button", { name: T[locale].create }).click();
        await p.waitForURL(/step=2/, { timeout: 30000 });
      }
      await go(p, "/onboarding?step=3");
    },
  ],
];

const only = process.argv.slice(2);
for (const [name, kind, run] of SHOTS.filter(
  ([name]) => only.length === 0 || only.includes(name),
)) {
  for (const locale of LOCALES) {
    const page = await context(locale, kind === "guest" ? "guest" : kind);
    await run(page, locale);
    await save(page, locale, name, TARGETS[name]);
  }
}
const sorted = Object.fromEntries(
  Object.entries(hotspots).map(([locale, shots]) => [
    locale,
    Object.fromEntries(Object.entries(shots).sort()),
  ]),
);
await writeFile(hotspotsFile, JSON.stringify(sorted, null, 2) + "\n");
await browser.close();
