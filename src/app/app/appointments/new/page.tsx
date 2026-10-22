import { Scissors } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { todayInZone } from "@/lib/time";

import { NewAppointmentForm } from "./new-appointment-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).appointments.new.title };
}

export default async function NewAppointmentPage({
  searchParams,
}: PageProps<"/app/appointments/new">) {
  const params = await searchParams;
  const workspace = await requireWorkspace();
  const n = (await getT()).appointments.new;
  const manageAll = can(workspace, "appointments.manage_all");
  if (!manageAll && !(can(workspace, "appointments.manage_own") && workspace.staffId)) notFound();
  const { business } = workspace;
  const supabase = await createClient();

  const [{ data: customers }, { data: services }, { data: staff }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, first_name, last_name, email")
      .eq("business_id", business.id)
      .order("first_name")
      .limit(500),
    supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents, staff_services(staff_id)")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("staff_members")
      .select("id, display_name")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("display_name"),
  ]);
  const allowedStaff = manageAll
    ? (staff ?? [])
    : (staff ?? []).filter((s) => s.id === workspace.staffId);

  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader title={n.title} description={n.description} />
      {!services || services.length === 0 || allowedStaff.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Scissors />}
            title={!services || services.length === 0 ? n.noService : n.noStaff}
            description={n.needBoth}
            action={
              <Button asChild>
                <Link
                  href={!services || services.length === 0 ? "/app/services/new" : "/app/staff/new"}
                >
                  {n.setUp}
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <NewAppointmentForm
          customers={(customers ?? []).map((c) => ({
            id: c.id,
            label:
              [c.first_name, c.last_name].filter(Boolean).join(" ") +
              (c.email ? ` · ${c.email}` : ""),
          }))}
          services={services.map((s) => ({
            ...s,
            staff_ids: s.staff_services.map((row) => row.staff_id),
          }))}
          staff={allowedStaff}
          defaults={{
            date: typeof params.date === "string" ? params.date : todayInZone(business.timezone),
            time: typeof params.time === "string" ? params.time : "10:00",
            staffId: typeof params.staff === "string" ? params.staff : (workspace.staffId ?? ""),
            customerId: typeof params.customer === "string" ? params.customer : "",
          }}
          currency={business.currency}
          locale={business.locale}
        />
      )}
    </div>
  );
}
