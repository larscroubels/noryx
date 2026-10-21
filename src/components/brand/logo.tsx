import Image from "next/image";

import { cn } from "@/lib/cn";

import lockup from "../../../public/brand/noryx-lockup.png";
import symbol from "../../../public/brand/noryx-symbol.png";
import wordmark from "../../../public/brand/noryx-wordmark.png";

const assets = { lockup, symbol, wordmark } as const;

type LogoProps = {
  /**
   * lockup   — stacked monogram + wordmark, for hero and brand moments
   * wordmark — the NORYX wordmark, for headers (keep at least 20px tall)
   * symbol   — the X monogram, for compact navigation and icons
   */
  variant?: keyof typeof assets;
  /** Rendered height in pixels; width follows the artwork's aspect ratio. */
  height: number;
  className?: string;
  priority?: boolean;
  /** Pass an empty string when the brand name is already visible next to the logo. */
  alt?: string;
};

/** The official NORYX artwork (derived from brand/source by scripts/generate-brand-assets.mjs). */
export function Logo({ variant = "wordmark", height, className, priority, alt = "NORYX" }: LogoProps) {
  const asset = assets[variant];
  const width = Math.round((asset.width / asset.height) * height);
  return (
    <Image
      src={asset}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn("select-none", className)}
      style={{ width, height }}
    />
  );
}
