import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { StaffProfileForm, StaffServicesForm } from "../forms";
import { SchedulePanels } from "../schedule-panels";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).staff.professional };
}

export default async function StaffDetailPage({
  params,
  searchParams,
}: PageProps<"/app/staff/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const { business } = await requirePermission("staff.manage");
  const s = (await getT()).staff;
  const supabase = await createClient();
  const [{ data: staff }, { data: locations }, { data: services }] = await Promise.all([
    supabase
      .from("staff_members")
      .select(
        "id, display_name, job_title, bio, email, phone, location_id, is_bookable, is_active, staff_services(service_id, price_cents, duration_minutes)",
      )
      .eq("business_id", business.id)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("locations")
      .select("id, name")
      .eq("business_id", business.id)
      .order("sort_order"),
    supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),
  ]);
  if (!staff) notFound();

  return (
    <div className="grid max-w-4xl gap-8">
      <PageHeader
        eyebrow={s.professional}
        title={staff.display_name}
        description={staff.job_title ?? undefined}
      />
      {query.created === "1" && (
        <Alert tone="success" title={s.created}>
          {s.createdText}
        </Alert>
      )}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{s.profile}</CardTitle>
            <CardDescription>{s.profileDescription}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <StaffProfileForm staff={staff} locations={locations ?? []} />
        </CardContent>
      </Card>
      <Card id="services">
        <CardHeader>
          <div>
            <CardTitle>{s.services}</CardTitle>
            <CardDescription>{s.servicesDescription(staff.display_name)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <StaffServicesForm
            staffId={staff.id}
            services={services ?? []}
            assignments={staff.staff_services}
            currency={business.currency}
            locale={business.locale}
          />
        </CardContent>
      </Card>
      <SchedulePanels staffId={staff.id} timeZone={business.timezone} />
    </div>
  );
}
