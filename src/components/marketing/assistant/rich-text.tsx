import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Renders the small subset of Markdown the assistant is asked to use: paragraphs,
 * "- " and "1. " lists, **bold** and links. Only links to pages of this site become
 * links; anything else stays plain text. No HTML is ever injected.
 */

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const BULLET = /^\s*[-*•]\s+/;
const NUMBER = /^\s*\d+[.)]\s+/;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const [, bold, label, href] = match;
    if (bold) {
      out.push(<strong key={match.index}>{bold}</strong>);
    } else if (href!.startsWith("/") && !href!.startsWith("//")) {
      out.push(
        <Link key={match.index} href={href!} className="font-semibold text-pink-700 underline underline-offset-2">
          {label}
        </Link>,
      );
    } else {
      out.push(label);
    }
    last = match.index + match[0].length;
  }
  out.push(text.slice(last));
  return out;
}

type Run = { kind: "p" | "ul" | "ol"; lines: string[] };

export function RichText({ text }: { text: string }) {
  const runs: Run[] = [];
  for (const block of text.trim().split(/\n{2,}/)) {
    const blockStart = runs.length;
    for (const line of block.split("\n")) {
      if (!line.trim()) continue;
      const kind = BULLET.test(line) ? "ul" : NUMBER.test(line) ? "ol" : "p";
      const content = line.replace(kind === "ul" ? BULLET : NUMBER, "");
      const last = runs.length > blockStart ? runs.at(-1) : undefined;
      if (last?.kind === kind) last.lines.push(content);
      else runs.push({ kind, lines: [content] });
    }
  }
  const items = (lines: string[]) =>
    lines.map((line, index) => <li key={index}>{inline(line)}</li>);
  return (
    <div className="grid gap-2">
      {runs.map((run, index) =>
        run.kind === "ul" ? (
          <ul key={index} className="grid list-disc gap-1 pl-5">
            {items(run.lines)}
          </ul>
        ) : run.kind === "ol" ? (
          <ol key={index} className="grid list-decimal gap-1 pl-5">
            {items(run.lines)}
          </ol>
        ) : (
          <p key={index}>
            {run.lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inline(line)}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
