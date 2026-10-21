import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-base" } as const;

/** Initials avatar on warm champagne; decorative when a name is shown next to it. */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-champagne-100 font-semibold text-rosegold-800 ring-1 ring-champagne-200",
        sizes[size],
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
