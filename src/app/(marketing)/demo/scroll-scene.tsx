"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Drives the scroll effects of the demo page with CSS variables, so any browser works:
 * - [data-scroll="hero"]    --p: 0 → 1 over the first 80% of the viewport scrolled
 * - [data-scroll="enter"]   --p: 0 when the top enters the viewport → 1 at 40% from the top
 * - [data-scroll="through"] --p: 0 entering at the bottom → 1 leaving at the top
 * - [data-stack]            --push: 0 → 1 as the next stacked card slides over this one
 * Under reduced motion everything is set to its finished state once and left alone.
 */
export function ScrollScene({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const scrolled = [...element.querySelectorAll<HTMLElement>("[data-scroll]")];
    const stack = [...element.querySelectorAll<HTMLElement>("[data-stack]")];
    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of scrolled) el.style.setProperty("--p", "1");
      for (const el of stack) el.style.setProperty("--push", "0");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of scrolled) {
        const box = el.getBoundingClientRect();
        const mode = el.dataset.scroll;
        const p =
          mode === "hero"
            ? clamp(window.scrollY / (vh * 0.8))
            : mode === "through"
              ? clamp((vh - box.top) / (vh + box.height))
              : clamp((vh - box.top) / (vh * 0.6));
        el.style.setProperty("--p", p.toFixed(3));
      }
      stack.forEach((card, index) => {
        const next = stack[index + 1];
        if (!next) return card.style.setProperty("--push", "0");
        const mine = card.getBoundingClientRect();
        const theirs = next.getBoundingClientRect();
        card.style.setProperty("--push", clamp((mine.bottom - theirs.top) / mine.height).toFixed(3));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
