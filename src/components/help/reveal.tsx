"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fades its content up when it scrolls into view. Content that is already visible on
 * load, and everything for visitors who prefer reduced motion, is shown immediately.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`transition-[opacity,translate] duration-700 ease-out data-[reveal=pending]:translate-y-6 data-[reveal=pending]:opacity-0 ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}
