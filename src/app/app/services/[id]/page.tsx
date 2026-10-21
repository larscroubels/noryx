import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConfirmAction } from "@/components/forms/confirm-action";
import { PageHeader } from "@/components/layout/page-header";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { deleteService } from "../actions";
import { ServiceForm } from "../service-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).services.editTitle };
}

export default async function EditServicePage({ params }: PageProps<"/app/services/[id]">) {
  const { id } = await params;
  const { business } = await requirePermission("services.manage");
  const t = await getT();
  const sv = t.services;
  const supabase = await createClient();
  const [{ data: service }, { data: categories }, { data: staff }] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id, name, category_id, description, duration_minutes, price_cents, promo_price_cents, buffer_after_minutes, is_active, is_online_bookable, staff_services(staff_id)",
      )
      .eq("business_id", business.id)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("service_categories")
      .select("id, name")
      .eq("business_id", business.id)
      .order("sort_order"),
    supabase
      .from("staff_members")
      .select("id, display_name, is_active")
      .eq("business_id", business.id)
      .order("sort_order")
      .order("display_name"),
  ]);
  if (!service) notFound();

  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader
        title={service.name}
        description={sv.editDescription}
        actions={
          <ConfirmAction
            trigger={
              <>
                <Trash2 aria-hidden="true" /> {t.common.delete}
              </>
            }
            title={sv.deleteTitle(service.name)}
            description={sv.deleteText}
            confirmLabel={sv.deleteConfirm}
            action={deleteService}
            hiddenFields={{ id: service.id }}
          />
        }
      />
      <ServiceForm
        service={service}
        categories={categories ?? []}
        staff={staff ?? []}
        assignedStaffIds={service.staff_services.map((row) => row.staff_id)}
      />
    </div>
  );
}
