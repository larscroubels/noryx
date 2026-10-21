import { NextResponse, type NextRequest } from "next/server";

import { getT } from "@/i18n/server";
import { authorize } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { toCsv } from "@/lib/csv";
import { categoryLabel, methodLabel } from "@/lib/finance/summary";
import { createClient } from "@/lib/supabase/server";
import { dayBoundsUtc } from "@/lib/time";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** CSV exports of recorded payments or expenses for a date range. */
export async function GET(request: NextRequest) {
  const workspace = await authorize("finance.view");
  if (!workspace || !hasFeature(await getEntitlements(workspace.business.id), "finance")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const type = searchParams.get("type");
  if (!DATE.test(from) || !DATE.test(to) || (type !== "payments" && type !== "expenses")) {
    return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  }
  const { business } = workspace;
  const [supabase, t] = await Promise.all([createClient(), getT()]);
  let csv: string;

  if (type === "payments") {
    const { data } = await supabase
      .from("payments")
      .select(
        "paid_at, amount_cents, currency, method, status, refunded_at, note, appointment:appointments(service_name, staff:staff_members(display_name))",
      )
      .eq("business_id", business.id)
      .gte("paid_at", dayBoundsUtc(from, business.timezone).start.toISOString())
      .lt("paid_at", dayBoundsUtc(to, business.timezone).end.toISOString())
      .order("paid_at")
      .range(0, 9999);
    csv = toCsv(
      [
        "paid_at",
        "amount",
        "currency",
        "method",
        "status",
        "refunded_at",
        "service",
        "professional",
        "note",
      ],
      (data ?? []).map((p) => [
        p.paid_at,
        (p.amount_cents / 100).toFixed(2),
        p.currency,
        methodLabel(t, p.method),
        p.status,
        p.refunded_at,
        p.appointment?.service_name,
        p.appointment?.staff?.display_name,
        p.note,
      ]),
    );
  } else {
    const { data } = await supabase
      .from("expenses")
      .select("spent_on, description, category, amount_cents, currency, supplier, reference")
      .eq("business_id", business.id)
      .gte("spent_on", from)
      .lte("spent_on", to)
      .order("spent_on")
      .range(0, 9999);
    csv = toCsv(
      ["date", "description", "category", "amount", "currency", "supplier", "reference"],
      (data ?? []).map((e) => [
        e.spent_on,
        e.description,
        categoryLabel(t, e.category),
        (e.amount_cents / 100).toFixed(2),
        e.currency,
        e.supplier,
        e.reference,
      ]),
    );
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${from}-to-${to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
