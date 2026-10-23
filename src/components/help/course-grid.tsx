"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { HelpCourse } from "@/content/help";
import { useT } from "@/i18n/client";

import { HelpIcon } from "./help-icon";
import { plainText } from "./rich-text";

/** Course cards with an instant search over titles, steps and questions. */
export function CourseGrid({ courses, basePath }: { courses: HelpCourse[]; basePath: string }) {
  const t = useT();
  const h = t.help;
  const [query, setQuery] = useState("");
  const index = useMemo(
    () =>
      courses.map((course) => ({
        course,
        text: [
          course.title,
          course.summary,
          ...course.steps.flatMap((step) => [step.title, ...step.body, step.tip ?? ""]),
          ...course.faq.flatMap((item) => [item.q, item.a]),
        ]
          .map(plainText)
          .join(" ")
          .toLocaleLowerCase(),
      })),
    [courses],
  );
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const shown = index
    .filter((entry) => terms.every((term) => entry.text.includes(term)))
    .map((entry) => entry.course);

  return (
    <div className="grid gap-8">
      <div className="max-w-xl">
        <label htmlFor="help-search" className="sr-only">
          {h.searchLabel}
        </label>
        <Input
          id="help-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={h.searchPlaceholder}
          leading={<Search />}
          className="h-12 text-base"
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {terms.length > 0 ? `${shown.length} / ${courses.length}` : ""}
      </p>
      {shown.length === 0 ? (
        <p className="rounded-xl bg-surface-subtle p-8 text-center text-fg-muted">{h.noResults}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((course, index) => (
            <li
              key={course.slug}
              className="row-span-4 grid grid-rows-subgrid gap-y-0 motion-safe:animate-card-in"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Link
                href={`${basePath}/${course.slug}`}
                className="group row-span-4 grid grid-rows-subgrid gap-y-0 rounded-xl border border-neutral-200/70 bg-surface p-5 shadow-sm transition hover:border-rosegold-300 hover:shadow-md"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-lg bg-pink-50 text-pink-700 ring-1 ring-pink-100"
                >
                  <HelpIcon icon={course.icon} className="size-5" />
                </span>
                <span className="mt-4 text-lg font-semibold">{course.title}</span>
                <span className="mt-1.5 text-sm text-fg-muted">{course.summary}</span>
                <span className="mt-5 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <Badge tone="neutral">{h.audience[course.audience]}</Badge>
                  {course.plan === "pro" && <Badge tone="brand">Pro</Badge>}
                  <span>
                    {h.steps(course.steps.length)} · {h.minutes(course.minutes)}
                  </span>
                  <ArrowRight
                    className="ml-auto size-4 text-pink-700 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
