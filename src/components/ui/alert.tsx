import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

const alertVariants = cva("flex gap-3 rounded-lg border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-info-100 bg-info-50 text-info-700",
      success: "border-success-100 bg-success-50 text-success-700",
      warning: "border-warning-100 bg-warning-50 text-warning-700",
      danger: "border-danger-100 bg-danger-50 text-danger-700",
      neutral: "border-border bg-surface-subtle text-fg",
    },
  },
  defaultVariants: { tone: "info" },
});

const icons = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  neutral: Info,
} as const;

type AlertProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof alertVariants> & {
    title?: ReactNode;
    action?: ReactNode;
  };

/** Inline message for feedback that belongs to a section or form. */
export function Alert({ className, tone = "info", title, action, children, ...props }: AlertProps) {
  const Icon = icons[tone ?? "info"];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="grid flex-1 gap-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && (
          <div className="leading-6 [&_a]:font-semibold [&_a]:underline">{children}</div>
        )}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
