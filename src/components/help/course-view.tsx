import { ArrowLeft, ArrowRight, Clock3, Lightbulb } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getCourse, helpContent } from "@/content/help";
import { getI18n } from "@/i18n/server";

import { FaqList } from "./faq-list";
import { HelpIcon } from "./help-icon";
import { RichText } from "./rich-text";
import { Screenshot } from "./screenshot";

/** One course: numbered steps with screenshots, then its questions. */
export async function CourseView({ basePath, slug }: { basePath: string; slug: string }) {
  const { t, locale } = await getI18n();
  const h = t.help;
  const course = getCourse(locale, slug);
  if (!course) notFound();
  const courses = helpContent[locale].courses;
  const next = courses[(courses.indexOf(course) + 1) % courses.length]!;

  return (
    <article className="grid gap-10">
      <Link
        href={basePath}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {h.all}
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-700 ring-1 ring-pink-100"
        >
          <HelpIcon icon={course.icon} className="size-6" />
        </span>
        <div className="max-w-3xl">
          <h1 className="font-display text-display-sm font-semibold sm:text-display-md">
            {course.title}
          </h1>
          <p className="mt-2 text-fg-muted sm:text-lg">{course.summary}</p>
          <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-fg-muted">
            <Badge tone="neutral">{h.audience[course.audience]}</Badge>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" /> {h.minutes(course.minutes)}
            </span>
            <span>{h.steps(course.steps.length)}</span>
          </p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:gap-14">
        <nav aria-label={h.contents} className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow">{h.contents}</p>
            <ol className="mt-3 grid gap-1 border-l border-border text-sm">
              {course.steps.map((step, index) => (
                <li key={step.title}>
                  <a
                    href={`#step-${index + 1}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-fg-muted hover:border-rosegold-400 hover:text-fg"
                  >
                    {index + 1}. {step.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#course-faq"
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-fg-muted hover:border-rosegold-400 hover:text-fg"
                >
                  {h.courseFaq}
                </a>
              </li>
            </ol>
          </div>
        </nav>

        <div className="grid gap-14">
          <ol className="grid gap-14">
            {course.steps.map((step, index) => (
              <li key={step.title} id={`step-${index + 1}`} className="grid scroll-mt-24 gap-5">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-700 text-sm font-semibold text-white"
                  >
                    {index + 1}
                  </span>
                  <div className="grid gap-3">
                    <h2 className="text-xl font-semibold">
                      <span className="sr-only">{h.step(index + 1)}: </span>
                      {step.title}
                    </h2>
                    {step.body.map((paragraph) => (
                      <p key={paragraph} className="max-w-2xl text-fg-muted">
                        <RichText text={paragraph} />
                      </p>
                    ))}
                    {step.tip && (
                      <p className="flex max-w-2xl gap-3 rounded-lg bg-surface-warm p-4 text-sm ring-1 ring-champagne-200">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-rosegold-700" aria-hidden="true" />
                        <span>
                          <strong className="font-semibold">{h.tip}: </strong>
                          <RichText text={step.tip} />
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                {step.image && (
                  <figure className="grid gap-2 sm:pl-13">
                    <Screenshot image={step.image} locale={locale} />
                  </figure>
                )}
              </li>
            ))}
          </ol>

          <section id="course-faq" aria-labelledby="course-faq-title" className="grid scroll-mt-24 gap-6">
            <h2 id="course-faq-title" className="font-display text-display-sm font-semibold">
              {h.courseFaq}
            </h2>
            <FaqList items={course.faq} />
          </section>

          <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-fg-muted">{h.screenshotNote}</p>
            <Link
              href={`${basePath}/${next.slug}`}
              className="group inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-xs hover:border-rosegold-300"
            >
              <span>
                <span className="block text-xs font-semibold text-fg-muted uppercase">{h.next}</span>
                <span className="font-semibold">{next.title}</span>
              </span>
              <ArrowRight
                className="size-4 text-pink-700 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
