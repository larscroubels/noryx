import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { getT } from "@/i18n/server";

/** Shown instead of a module that isn't part of the business's current plan. */
export async function PlanLocked({
  title,
  heading,
  text,
}: {
  title: string;
  heading: string;
  text: string;
}) {
  const t = await getT();
  return (
    <div className="grid max-w-3xl gap-6">
      <PageHeader title={title} />
      <Alert tone="info" title={heading}>
        {text}{" "}
        <Link href="/pricing" className="font-semibold">
          {t.settings.plan.comparePlans}
        </Link>
      </Alert>
    </div>
  );
}
