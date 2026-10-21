import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { ServiceForm } from "../service-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).services.new };
}

export default async function NewServicePage() {
  const { business } = await requirePermission("services.manage");
  const sv = (await getT()).services;
  const supabase = await createClient();
  const [{ data: categories }, { data: staff }] = await Promise.all([
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
  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader title={sv.new} description={sv.newDescription} />
      <ServiceForm categories={categories ?? []} staff={staff ?? []} assignedStaffIds={[]} />
    </div>
  );
}
