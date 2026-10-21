import { Clock4 } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";

import { SchedulePanels } from "../staff/schedule-panels";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).staff.mySchedule.title };
}

export default async function MySchedulePage() {
  const workspace = await requirePermission("schedule.manage_own");
  const m = (await getT()).staff.mySchedule;
  return (
    <div className="grid max-w-4xl gap-8">
      <PageHeader
        title={m.title}
        description={m.description}
      />
      {workspace.staffId ? (
        <SchedulePanels staffId={workspace.staffId} timeZone={workspace.business.timezone} />
      ) : (
        <Card>
          <EmptyState
            icon={<Clock4 />}
            title={m.noProfile}
            description={m.noProfileText}
          />
        </Card>
      )}
    </div>
  );
}
