import Image from "next/image";

import type { HelpImage } from "@/content/help";
import { helpImageSrc } from "@/content/help";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/** A course screenshot in a light browser or phone frame. */
export function Screenshot({ image, locale }: { image: HelpImage; locale: Locale }) {
  const src = helpImageSrc(locale, image.name);
  if (image.mobile) {
    return (
      <div className="mx-auto w-full max-w-[17rem] rounded-[2rem] border border-neutral-200 bg-surface p-2 shadow-lg">
        <Image
          src={src}
          alt={image.alt}
          width={390}
          height={844}
          sizes="17rem"
          className="h-auto w-full rounded-[1.5rem]"
        />
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-lg">
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-border bg-surface-subtle px-3 py-2">
        {["bg-neutral-300", "bg-neutral-300", "bg-neutral-300"].map((tone, index) => (
          <span key={index} className={cn("size-2.5 rounded-full", tone)} />
        ))}
      </div>
      <Image
        src={src}
        alt={image.alt}
        width={1440}
        height={900}
        sizes="(min-width: 1280px) 52rem, (min-width: 1024px) 60vw, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}
