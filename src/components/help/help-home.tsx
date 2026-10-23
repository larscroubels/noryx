import { LifeBuoy } from "lucide-react";

import { helpContent } from "@/content/help";
import { getI18n } from "@/i18n/server";

import { CourseGrid } from "./course-grid";
import { FaqList } from "./faq-list";

/** Help-centre home, shared by the public site (/help) and the workspace (/app/help). */
export async function HelpHome({
  basePath,
  compact = false,
  showFaq = true,
}: {
  basePath: string;
  compact?: boolean;
  /** The public site has its own FAQ page, so /help links there instead. */
  showFaq?: boolean;
}) {
  const { t, locale } = await getI18n();
  const content = helpContent[locale];
  const h = t.help;
  return (
    <div className="grid gap-14">
      <header className={compact ? "" : "max-w-3xl"}>
        <p className="flex items-center gap-2 eyebrow">
          <LifeBuoy className="size-4" aria-hidden="true" /> {h.eyebrow}
        </p>
        <h1
          className={
            compact
              ? "mt-2 font-display text-display-sm font-semibold"
              : "mt-3 font-display text-display-md font-semibold sm:text-display-lg"
          }
        >
          {h.title}
        </h1>
        <p className="mt-3 max-w-2xl text-fg-muted sm:text-lg">{h.lead}</p>
      </header>
      <section id="courses" aria-label={h.courses} className="scroll-mt-24">
        <CourseGrid courses={content.courses} basePath={basePath} />
      </section>
      {showFaq && (
        <section aria-labelledby="help-faq" className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <h2 id="help-faq" className="font-display text-display-sm font-semibold">
            {h.faq}
          </h2>
          <FaqList items={content.faq} />
        </section>
      )}
    </div>
  );
}
