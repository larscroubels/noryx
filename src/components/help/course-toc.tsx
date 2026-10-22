"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

/** Sticky table of contents that follows the step being read, plus a reading progress bar. */
export function CourseToc({
  label,
  items,
}: {
  label: string;
  items: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0]!.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-pink-400 transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
      <nav aria-label={label} className="hidden lg:block">
        <div className="sticky top-24">
          <p className="eyebrow">{label}</p>
          <ol className="mt-3 grid gap-1 border-l border-border text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-4 transition-colors duration-300",
                    active === item.id
                      ? "border-pink-700 font-semibold text-fg"
                      : "border-transparent text-fg-muted hover:border-rosegold-400 hover:text-fg",
                  )}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
