import { ArrowRight, LifeBuoy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FaqList } from "@/components/help/faq-list";
import { helpContent } from "@/content/help";
import { getI18n, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.marketing.faq.metaTitle, description: t.marketing.faq.lead };
}

/** Every general question in one place: about NORYX and the plans, and about using NORYX. */
export default async function FaqPage() {
  const { t, locale } = await getI18n();
  const faq = t.marketing.faq;
  const groups = [
    { id: "faq-product", title: t.site.faqGroups.product, items: faq.items },
    { id: "faq-usage", title: t.site.faqGroups.usage, items: helpContent[locale].faq },
  ];
  return (
    <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.6fr]">
      <header className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow">{faq.eyebrow}</p>
        <h1 className="mt-3 font-display text-display-md font-semibold sm:text-display-lg">
          {faq.title}
        </h1>
        <p className="mt-4 text-fg-muted sm:text-lg">{faq.lead}</p>
        <div className="mt-8 rounded-xl bg-surface-warm p-5 ring-1 ring-champagne-200">
          <p className="flex items-center gap-2 font-semibold">
            <LifeBuoy className="size-4 text-rosegold-700" aria-hidden="true" /> {faq.helpTitle}
          </p>
          <p className="mt-1 text-sm text-fg-muted">{faq.helpText}</p>
          <Link
            href="/help"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-pink-700 hover:underline"
          >
            {faq.helpLink} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>
      <div className="grid gap-12">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={group.id}>
            <h2 id={group.id} className="font-display text-display-sm font-semibold">
              {group.title}
            </h2>
            <div className="mt-4">
              <FaqList items={group.items} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
