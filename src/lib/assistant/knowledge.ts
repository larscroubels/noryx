import { helpContent } from "@/content/help";
import { legalContent } from "@/content/legal";
import { INTL_LOCALE, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import {
  CUSTOM_SITE_FEE_CENTS,
  formatWholeEuros,
  NEWSLETTER_MONTHLY_CENTS,
} from "@/lib/billing/pricing";

import type { AssistantSource } from "./events";

/**
 * What the website assistant knows: the public website's own copy (home page,
 * every page of the main navigation and every help-centre course) in one language.
 * Built only from the dictionaries and help content, so it always matches the
 * pages and needs no separate maintenance. Deterministic, so the prompt cache holds.
 */

const LANGUAGE_NAME: Record<Locale, string> = { nl: "Nederlands", fr: "Français", en: "English" };

const cache = new Map<Locale, string>();

const list = (items: { title: string; text: string }[]) =>
  items.map((item) => `- ${item.title}: ${item.text}`).join("\n");

export function buildKnowledge(locale: Locale): string {
  const cached = cache.get(locale);
  if (cached) return cached;

  const t = dictionaries[locale];
  const m = t.marketing;
  const p = t.pricing;
  const a = t.audience;
  const app = t.appShowcase;
  const site = t.site;
  const help = helpContent[locale];
  const legal = legalContent(locale);
  const legalPage = (path: string, doc: typeof legal.privacy) =>
    [
      `# ${doc.title} (${path})\n${doc.lead}`,
      ...doc.sections.map((section) =>
        [
          `## ${section.title}`,
          ...section.paragraphs,
          ...(section.list ?? []).map((item) => `- ${item}`),
          ...(section.table?.rows ?? []).map((row) => `- ${row.join(" | ")}`),
        ].join("\n"),
      ),
    ].join("\n\n");
  const euros = (cents: number) => formatWholeEuros(cents, INTL_LOCALE[locale]);
  const cell = (value: boolean | string) =>
    typeof value === "string" ? value : value ? p.compare.included : p.compare.notIncluded;

  const plans = (["basic", "pro"] as const).map((key) => {
    const plan = p.plans[key];
    return [
      `### ${plan.name}`,
      plan.tagline,
      `${p.priceSoon}. ${p.priceNote}`,
      "everything" in plan ? plan.everything : "",
      plan.features.map((feature) => `- ${feature}`).join("\n"),
      "soon" in plan ? `${p.soonBadge}: ${plan.soon}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const courses = help.courses.map((course) =>
    [
      `### ${course.title} (/help/${course.slug})`,
      course.summary,
      `${t.help.audience[course.audience]}${course.plan ? ` · ${p.plans.pro.name}` : ""}`,
      ...course.steps.map((step, index) =>
        [
          `${index + 1}. ${step.title}`,
          ...step.body,
          step.tip ? `${t.help.tip}: ${step.tip}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
      ...course.faq.map((item) => `Q: ${item.q}\nA: ${item.a}`),
    ].join("\n\n"),
  );

  const text = [
    `Site language: ${LANGUAGE_NAME[locale]} (${locale})`,
    `# ${m.meta.title} (/)`,
    `${m.hero.titleStart} ${m.hero.titleEmphasis} ${m.hero.titleEnd}\n${m.hero.lead}\n${m.hero.bullets.map((bullet) => `- ${bullet}`).join("\n")}\n${m.hero.badge}`,
    `## ${site.home.benefitsTitle}\n${list(site.home.benefits)}`,
    `# ${m.nav.platform} (/booking-platform)\n${site.platform.title}\n${site.platform.lead}`,
    `## ${site.platform.howTitle}\n${site.platform.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`).join("\n")}`,
    `## ${m.booking.title}\n${m.booking.lead}\n${list(m.booking.points)}`,
    `## ${site.platform.featuresTitle}\n${m.features.lead}\n${list(m.features.items)}`,
    `## ${site.platform.manageTitle}\n${site.platform.manageLead}\n${list(m.team.items)}`,
    `## ${m.roadmap.title} (${m.roadmap.badge})\n${m.roadmap.lead}\n${list(m.roadmap.items)}`,
    `# ${m.nav.apps} (/apps)\n${site.apps.title}\n${site.apps.lead}`,
    ...[site.apps.clients, site.apps.business].map(
      (side) => `## ${side.title} (${side.eyebrow})\n${side.lead}\n${side.points.map((point) => `- ${point}`).join("\n")}`,
    ),
    site.apps.webNote,
    `## ${app.eyebrow} (/apps#app)\n${app.status}\n${app.lead}\n${list(app.steps)}\n${app.benefitsTitle}:\n${list(app.benefits)}\n${app.ctaText}`,
    `# ${a.title} (/for-you)\n${a.lead}\n${list(a.segments)}\n\n## ${a.rolesTitle}\n${list(a.roles)}`,
    `# ${p.title} (/pricing)\n${p.lead}\n\n${plans.join("\n\n")}`,
    `## ${p.addOns.title}\n${p.addOns.lead}\n- ${p.addOns.newsletter.name} (${p.soonBadge}): ${p.addOns.newsletter.text} ${p.addOns.newsletter.price(euros(NEWSLETTER_MONTHLY_CENTS))}. ${p.addOns.newsletter.note}\n- ${p.addOns.customSite.name}: ${p.addOns.customSite.text} ${p.addOns.customSite.price(euros(CUSTOM_SITE_FEE_CENTS))}. ${p.addOns.customSite.note}`,
    `## ${p.compare.title}\n${p.compare.rows
      .map((row) => `- ${row.label}: Basic ${cell(row.basic)}; Pro ${cell(row.pro)}`)
      .join("\n")}`,
    `## ${p.trial.title}\n${p.trial.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`).join("\n")}\n${p.billingNote}`,
    `# ${m.faq.title} (/faq)\n${m.faq.items.map((item) => `Q: ${item.q}\nA: ${item.a}`).join("\n\n")}`,
    `# ${t.help.title} (/help)\n${t.help.lead}\n\n${help.faq.map((item) => `Q: ${item.q}\nA: ${item.a}`).join("\n\n")}`,
    `## ${site.support.contact.title} (/help#contact)\n${site.support.contact.lead}\n${site.support.contact.privacy}`,
    courses.join("\n\n"),
    legalPage("/privacy", legal.privacy),
    legalPage("/cookies", legal.cookies),
  ].join("\n\n");

  cache.set(locale, text);
  return text;
}

type Entry = AssistantSource & { searchText: string };

function entries(locale: Locale): Entry[] {
  const m = dictionaries[locale].marketing;
  const help = helpContent[locale];
  return [
    ...m.faq.items.map((item) => ({ title: item.q, text: item.a, href: "/faq", searchText: item.a })),
    ...help.faq.map((item) => ({ title: item.q, text: item.a, href: "/help", searchText: item.a })),
    ...help.courses.flatMap((course) => [
      {
        title: course.title,
        text: course.summary,
        href: `/help/${course.slug}`,
        searchText: [course.summary, ...course.steps.flatMap((step) => [step.title, ...step.body])].join(" "),
      },
      ...course.faq.map((item) => ({
        title: item.q,
        text: item.a,
        href: `/help/${course.slug}`,
        searchText: item.a,
      })),
    ]),
  ];
}

const words = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/** Short terms must match a whole word ("pro" is not "profile"); longer ones the start of a word. */
const matches = (haystack: string[], term: string) =>
  haystack.some((word) => (term.length <= 3 ? word === term : word.startsWith(term)));

/** Common short words in Dutch, French and English that say nothing about the topic. */
const STOPWORDS = new Set(
  (
    "the and for are can how what does with you your have that this from when where which will about work works " +
    "wat hoe het een van voor mijn kan ben ook als bij naar wel heb hebben moet niet met die dat deze zijn " +
    "wordt waar wanneer welke kunnen jullie ik je jij er werkt werken " +
    "les des une est que qui pour avec comment quoi mon mes dans sur pas peut peux vous nous quel quelle marche fonctionne"
  ).split(" "),
);

/**
 * Keyword search over the FAQ and help centre, for when the AI assistant isn't
 * configured. Titles weigh more than text; ties keep the FAQ order.
 */
export function searchKnowledge(locale: Locale, query: string, limit = 3): AssistantSource[] {
  const terms = [...new Set(words(query).filter((term) => term.length >= 3 && !STOPWORDS.has(term)))];
  if (terms.length === 0) return [];
  return entries(locale)
    .map((entry) => {
      const title = words(entry.title);
      const body = words(entry.searchText);
      const score = terms.reduce(
        (total, term) => total + (matches(title, term) ? 3 : 0) + (matches(body, term) ? 1 : 0),
        0,
      );
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ entry }) => ({
      title: entry.title,
      text: entry.text.replaceAll("**", ""),
      href: entry.href,
    }));
}
