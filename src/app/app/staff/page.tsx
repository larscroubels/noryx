import { Plus, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).staff.metaTitle };
}

export default async function StaffPage() {
  const { business } = await requirePermission("staff.manage");
  const t = await getT();
  const s = t.staff;
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("staff_members")
    .select(
      "id, display_name, job_title, is_active, is_bookable, user_id, staff_services(service_id), staff_working_hours(weekday)",
    )
    .eq("business_id", business.id)
    .order("is_active", { ascending: false })
    .order("sort_order")
    .order("display_name");

  return (
    <div className="grid gap-8">
      <PageHeader
        title={s.metaTitle}
        description={s.description}
        actions={
          <Button asChild>
            <Link href="/app/staff/new">
              <Plus aria-hidden="true" /> {s.add}
            </Link>
          </Button>
        }
      />
      {!staff || staff.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserRound />}
            title={s.emptyTitle}
            description={s.emptyText}
            action={
              <Button asChild>
                <Link href="/app/staff/new">{s.emptyAction}</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => {
            const days = [...new Set(member.staff_working_hours.map((h) => h.weekday))].sort();
            return (
              <Link key={member.id} href={`/app/staff/${member.id}`} className="group">
                <Card className="h-full p-5 transition-shadow group-hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <Avatar name={member.display_name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{member.display_name}</p>
                      <p className="truncate text-sm text-fg-muted">
                        {member.job_title || s.professional}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {!member.is_active && <Badge>{t.common.inactive}</Badge>}
                        {member.is_active && !member.is_bookable && (
                          <Badge tone="outline">{s.notBookable}</Badge>
                        )}
                        {member.user_id && <Badge tone="gold">{s.hasLogin}</Badge>}
                      </div>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                    <div>
                      <dt className="text-fg-muted">{s.services}</dt>
                      <dd className="font-semibold">{member.staff_services.length}</dd>
                    </div>
                    <div>
                      <dt className="text-fg-muted">{s.worksOn}</dt>
                      <dd className="font-semibold">
                        {days.length === 0 ? (
                          <span className="text-warning-700">{s.noHours}</span>
                        ) : (
                          days.map((d) => t.common.weekdaysShort[d - 1]).join(", ")
                        )}
                      </dd>
                    </div>
                  </dl>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
