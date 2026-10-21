import { NextResponse } from "next/server";

import { authorize } from "@/lib/auth/session";
import { toCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

/** CSV export of the customer list (up to 10,000 rows per download). */
export async function GET() {
  const workspace = await authorize("customers.manage");
  if (!workspace) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("first_name, last_name, email, phone, marketing_opt_in, source, created_at")
    .eq("business_id", workspace.business.id)
    .order("created_at")
    .range(0, 9999);
  const csv = toCsv(
    ["first_name", "last_name", "email", "phone", "marketing_opt_in", "source", "created_at"],
    (data ?? []).map((c) => [
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.marketing_opt_in,
      c.source,
      c.created_at,
    ]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
