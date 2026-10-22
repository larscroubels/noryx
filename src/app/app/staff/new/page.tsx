import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { StaffProfileForm } from "../forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).staff.add };
}

export default async function NewStaffPage() {
  const { business } = await requirePermission("staff.manage");
  const s = (await getT()).staff;
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("sort_order");
  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader title={s.newTitle} description={s.newDescription} />
      <Card>
        <CardContent>
          <StaffProfileForm locations={locations ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
