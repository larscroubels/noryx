import { cn } from "@/lib/cn";

type SpinnerProps = {
  className?: string;
  /** Accessible label announced to screen readers. Omit when a parent already announces the state. */
  label?: string;
};

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-block size-4 shrink-0", className)}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-full animate-spin">
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2.5"
        />
        <path
          d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
