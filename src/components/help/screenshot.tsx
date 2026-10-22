"use client";

import { Pointer } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import type { HelpHotspot, HelpImage } from "@/content/help";

const MOVE = 900;
const PRESS = 180;
const DWELL = 900;
const FADE = 350;

type Timeline = { duration: number; clicks: number[]; arrivals: number[] };

/** Cursor timeline: glide to each target, click, dwell, then fade out and loop. */
function timeline(count: number): Timeline {
  const clicks: number[] = [];
  const arrivals: number[] = [];
  let time = FADE;
  for (let index = 0; index < count; index += 1) {
    time += MOVE;
    arrivals.push(time);
    clicks.push(time + 120);
    time += PRESS + DWELL;
  }
  return { duration: time + 900 + FADE + 500, clicks, arrivals };
}

const center = (box: HelpHotspot) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

/**
 * A course screenshot with an animated cursor (or finger on phone screenshots) that
 * glides to the elements named in the step and clicks them. The animation only runs
 * while visible and is replaced by static highlights when reduced motion is preferred.
 */
export function Screenshot({
  image,
  src,
  hotspots,
}: {
  image: HelpImage;
  src: string;
  hotspots: HelpHotspot[];
}) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = stage.current;
    if (!root || hotspots.length === 0) return;
    // Reduced motion: no cursor; the highlights are shown statically via motion-reduce classes.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { duration, clicks, arrivals } = timeline(hotspots.length);
    const at = (ms: number) => Math.min(Math.max(ms / duration, 0), 1);
    const points = hotspots.map(center);
    const first = points[0]!;
    const start = {
      x: Math.min(Math.max(first.x + (first.x < 60 ? 16 : -16), 6), 94),
      y: Math.min(Math.max(first.y + 22, 8), 92),
    };
    const position = (p: { x: number; y: number }) => ({ left: `${p.x}%`, top: `${p.y}%` });
    const options: KeyframeAnimationOptions = { duration, iterations: Infinity };

    const cursorFrames: Keyframe[] = [
      { offset: 0, opacity: 0, ...position(start) },
      { offset: at(FADE), opacity: 1, ...position(start), easing: "cubic-bezier(.45,0,.2,1)" },
    ];
    points.forEach((point, index) => {
      cursorFrames.push({ offset: at(arrivals[index]!), opacity: 1, ...position(point) });
      const leave =
        index < points.length - 1 ? arrivals[index]! + PRESS + DWELL : duration - FADE - 500;
      cursorFrames.push({
        offset: at(leave),
        opacity: 1,
        ...position(point),
        easing: "cubic-bezier(.45,0,.2,1)",
      });
    });
    const last = points[points.length - 1]!;
    cursorFrames.push({ offset: at(duration - 500), opacity: 0, ...position(last) });
    cursorFrames.push({ offset: 1, opacity: 0, ...position(start) });

    const pressFrames: Keyframe[] = [{ offset: 0, transform: "scale(1)" }];
    for (const click of clicks) {
      pressFrames.push(
        { offset: at(click - 60), transform: "scale(1)" },
        { offset: at(click + 40), transform: "scale(0.8)" },
        { offset: at(click + 200), transform: "scale(1)" },
      );
    }
    pressFrames.push({ offset: 1, transform: "scale(1)" });

    const animations: Animation[] = [];
    const cursor = root.querySelector<HTMLElement>("[data-cursor]");
    const press = root.querySelector<HTMLElement>("[data-press]");
    if (cursor) animations.push(cursor.animate(cursorFrames, options));
    if (press) animations.push(press.animate(pressFrames, options));

    root.querySelectorAll<HTMLElement>("[data-highlight]").forEach((element, index) => {
      const shown = clicks[index]!;
      const hidden = index < clicks.length - 1 ? arrivals[index + 1]! : duration - 500;
      animations.push(
        element.animate(
          [
            { offset: 0, opacity: 0 },
            { offset: at(shown), opacity: 0 },
            { offset: at(shown + 160), opacity: 1 },
            { offset: at(hidden), opacity: 1 },
            { offset: at(hidden + 250), opacity: 0 },
            { offset: 1, opacity: 0 },
          ],
          options,
        ),
      );
    });
    root.querySelectorAll<HTMLElement>("[data-ripple]").forEach((element, index) => {
      const click = clicks[index]!;
      animations.push(
        element.animate(
          [
            { offset: 0, opacity: 0, transform: "scale(0.3)" },
            { offset: at(click), opacity: 0, transform: "scale(0.3)" },
            { offset: at(click + 20), opacity: 0.55, transform: "scale(0.3)" },
            { offset: at(click + 700), opacity: 0, transform: "scale(2.4)" },
            { offset: 1, opacity: 0, transform: "scale(2.4)" },
          ],
          options,
        ),
      );
    });

    animations.forEach((animation) => animation.pause());
    const observer = new IntersectionObserver(
      ([entry]) =>
        animations.forEach((animation) =>
          entry?.isIntersecting ? animation.play() : animation.pause(),
        ),
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [hotspots]);

  const overlay = (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {hotspots.map((box, index) => (
        <span
          key={`h${index}`}
          data-highlight
          className="absolute rounded-lg opacity-0 shadow-[0_0_0_6px_rgb(224_115_138/0.18)] ring-2 ring-pink-400 motion-reduce:opacity-100"
          style={{
            left: `calc(${box.x}% - 4px)`,
            top: `calc(${box.y}% - 4px)`,
            width: `calc(${box.w}% + 8px)`,
            height: `calc(${box.h}% + 8px)`,
          }}
        />
      ))}
      {hotspots.map((box, index) => {
        const point = center(box);
        return (
          <span
            key={`r${index}`}
            className="absolute"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span
              data-ripple
              className="absolute -top-6 -left-6 size-12 rounded-full bg-pink-400 opacity-0"
            />
          </span>
        );
      })}
      <span
        data-cursor
        className="absolute opacity-0 motion-reduce:hidden"
        style={{ left: "70%", top: "80%" }}
      >
        <span data-press className="block origin-top-left">
          {image.mobile ? (
            <Pointer
              className="-mt-1.5 -ml-3.5 size-9 fill-white stroke-neutral-900 drop-shadow-md"
              strokeWidth={1.6}
            />
          ) : (
            <svg width="22" height="28" viewBox="0 0 22 28" className="drop-shadow-md">
              <path
                d="M1.5 1.5v21.2l5.3-5.1 3.6 8.4 3.6-1.6-3.6-8.2h7.4z"
                fill="#fff"
                stroke="#1c1a1a"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    </div>
  );

  if (image.mobile) {
    return (
      <div className="mx-auto w-full max-w-[17rem] rounded-[2rem] border border-neutral-200 bg-surface p-2 shadow-lg">
        <div ref={stage} className="relative overflow-hidden rounded-[1.5rem]">
          <Image
            src={src}
            alt={image.alt}
            width={390}
            height={844}
            sizes="17rem"
            className="h-auto w-full"
          />
          {overlay}
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-lg">
      <div
        aria-hidden="true"
        className="flex items-center gap-1.5 border-b border-border bg-surface-subtle px-3 py-2"
      >
        {[0, 1, 2].map((index) => (
          <span key={index} className="size-2.5 rounded-full bg-neutral-300" />
        ))}
      </div>
      <div ref={stage} className="relative">
        <Image
          src={src}
          alt={image.alt}
          width={1440}
          height={900}
          sizes="(min-width: 1280px) 52rem, (min-width: 1024px) 60vw, 100vw"
          className="h-auto w-full"
        />
        {overlay}
      </div>
    </div>
  );
}
