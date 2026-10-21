import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Placeholder block shown while content loads. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-neutral-100", className)}
      {...props}
    />
  );
}

type StateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Friendly explanation of an empty list, with the next step to take. */
export function EmptyState({ icon, title, description, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      {icon && (
        <div
          aria-hidden="true"
          className="mb-4 flex size-12 items-center justify-center rounded-full bg-champagne-50 text-rosegold-700 ring-1 ring-champagne-200 [&_svg]:size-5"
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

/** Explains that something failed and how to recover. Never shows raw error details. */
export function ErrorState({
  title,
  description,
  action,
  className,
}: Partial<StateProps>) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center px-6 py-12 text-center", className)}
    >
      <div
        aria-hidden="true"
        className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-600 ring-1 ring-danger-100"
      >
        <CircleAlert className="size-5" />
      </div>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
