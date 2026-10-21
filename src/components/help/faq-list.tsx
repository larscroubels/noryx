import type { HelpFaq } from "@/content/help";

import { RichText } from "./rich-text";

/** Accessible accordion built on <details>, so it works without JavaScript. */
export function FaqList({ items }: { items: HelpFaq[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-champagne-50 text-rosegold-700 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-fg-muted">
            <RichText text={item.a} />
          </p>
        </details>
      ))}
    </div>
  );
}
