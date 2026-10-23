import Link from "next/link";
import type { ReactNode } from "react";

import { legalContent, type LegalKind } from "@/content/legal";
import { getI18n } from "@/i18n/server";
import { formatLocalDate } from "@/lib/format";
import { LEGAL_UPDATED } from "@/lib/legal";

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** **bold** and [label](href); site paths become client-side links, others open normally. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const [, bold, label, href] = match;
    const className = "font-semibold text-pink-700 underline underline-offset-2 hover:text-pink-800";
    if (bold) out.push(<strong key={match.index} className="font-semibold text-fg">{bold}</strong>);
    else if (href!.startsWith("/") || href!.startsWith("#"))
      out.push(<Link key={match.index} href={href!} className={className}>{label}</Link>);
    else
      out.push(
        <a key={match.index} href={href} className={className} {...(href!.startsWith("http") ? { rel: "noopener" } : {})}>
          {label}
        </a>,
      );
    last = match.index + match[0].length;
  }
  out.push(text.slice(last));
  return out;
}

/** One legal page (privacy, cookies, terms or legal notice) with a table of contents. */
export async function LegalDocument({ kind }: { kind: LegalKind }) {
  const { t, locale, intl } = await getI18n();
  const content = legalContent(locale);
  const doc = content[kind];
  return (
    <>
      <section className="border-b border-border bg-surface-subtle">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">{t.site.legal.eyebrow}</p>
            <h1 className="mt-3 font-display text-display-md font-semibold text-balance sm:text-display-lg">{doc.title}</h1>
            <p className="mt-4 max-w-2xl text-fg-muted sm:text-lg">{doc.lead}</p>
            <p className="mt-4 text-sm text-fg-muted">
              {content.updated(formatLocalDate(LEGAL_UPDATED, { day: "numeric", month: "long", year: "numeric" }, intl))}
            </p>
            {content.translationNote && <p className="mt-1 text-sm text-fg-muted">{content.translationNote}</p>}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-labelledby="legal-contents" className="lg:sticky lg:top-28 lg:self-start">
          <p id="legal-contents" className="text-sm font-semibold">
            {content.contents}
          </p>
          <ol className="mt-3 grid gap-1.5 text-sm text-fg-muted">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="hover:text-fg">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="grid max-w-3xl gap-10">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
              <h2 id={`${section.id}-title`} className="font-display text-display-sm font-semibold">
                {section.title}
              </h2>
              <div className="mt-3 grid gap-3 leading-7 text-fg-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{inline(paragraph)}</p>
                ))}
                {section.list && (
                  <ul className="grid list-disc gap-2 pl-5 marker:text-rosegold-500">
                    {section.list.map((item) => (
                      <li key={item}>{inline(item)}</li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div className="overflow-x-auto rounded-xl ring-1 ring-border" tabIndex={0} role="region" aria-label={section.title}>
                    <table className="w-full min-w-[36rem] bg-surface text-left text-sm">
                      <thead className="bg-surface-subtle text-fg">
                        <tr>
                          {section.table.headers.map((header) => (
                            <th key={header} scope="col" className="px-4 py-3 font-semibold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {section.table.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, index) =>
                              index === 0 ? (
                                <th key={index} scope="row" className="px-4 py-3 align-top font-mono text-xs font-semibold text-fg">
                                  {cell}
                                </th>
                              ) : (
                                <td key={index} className="px-4 py-3 align-top">
                                  {cell}
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
