import { NextResponse } from "next/server";

import { authorize } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/** GDPR data export for one customer (JSON download). */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/app/customers/[id]/export">,
) {
  const { id } = await params;
  const workspace = await authorize("customers.manage");
  if (!workspace) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const supabase = await createClient();
  const [{ data: customer }, { data: appointments }, { data: notes }] = await Promise.all([
    supabase
      .from("customers")
      .select("first_name, last_name, email, phone, marketing_opt_in, source, created_at")
      .eq("id", id)
      .eq("business_id", workspace.business.id)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select(
        "starts_at, ends_at, status, service_name, price_cents, currency, customer_note, created_at",
      )
      .eq("customer_id", id)
      .eq("business_id", workspace.business.id)
      .order("starts_at"),
    supabase
      .from("customer_notes")
      .select("body, created_at")
      .eq("customer_id", id)
      .eq("business_id", workspace.business.id),
  ]);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      controller: workspace.business.name,
      customer,
      appointments: appointments ?? [],
      notes: notes ?? [],
    },
    null,
    2,
  );
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="customer-${id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
