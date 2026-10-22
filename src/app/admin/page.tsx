import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

import { StatusForm, SubscriptionForm } from "./status-form";

const STATUS_TONE = { active: "success", suspended: "warning", closed: "neutral" } as const;

export default async function AdminPage() {
  const [supabase, { t, intl }] = await Promise.all([createClient(), getI18n()]);
  const a = t.admin;
  const [
    { data: stats },
    { data: businesses },
    { data: events },
    { data: plans },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.rpc("admin_platform_stats"),
    supabase.rpc("admin_list_businesses"),
    supabase
      .from("audit_events")
      .select("id, action, entity_type, business_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("plans").select("id, name").eq("is_active", true).order("sort_order"),
    supabase.from("business_subscriptions").select("business_id, plan_id, status, trial_ends_at"),
  ]);
  const s = (stats ?? {}) as Record<string, number>;
  const figures = [
    [a.stats.businesses, s.businesses_total],
    [a.stats.active, s.businesses_active],
    [a.stats.new30, s.businesses_new_30d],
    [a.stats.pagesLive, s.booking_pages_live],
    [a.stats.members, s.members_total],
    [a.stats.appointments30, s.appointments_30d],
    [a.stats.online30, s.online_bookings_30d],
    [a.stats.unsent30, s.notifications_skipped_30d],
  ] as const;
  const names = new Map((businesses ?? []).map((b) => [b.id, b.name]));
  const subscriptionFor = new Map((subscriptions ?? []).map((sub) => [sub.business_id, sub]));

  return (
    <div className="grid gap-8">
      <PageHeader title={a.title} description={a.description} />

      <section aria-label={a.statsLabel} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {figures.map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-fg-muted">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{Number(value ?? 0)}</p>
          </Card>
        ))}
      </section>

      <Alert tone="info" title={a.billingTitle}>
        {a.billingText}
      </Alert>

      <Card className="overflow-hidden">
        <CardHeader className="pb-5">
          <CardTitle>{a.businesses}</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{a.columns.business}</TableHead>
              <TableHead>{a.columns.owner}</TableHead>
              <TableHead>{a.columns.usage}</TableHead>
              <TableHead>{a.columns.status}</TableHead>
              <TableHead>{a.columns.plan}</TableHead>
              <TableHead>{a.columns.change}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(businesses ?? []).map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-fg-muted">
                    /{b.slug} ·{" "}
                    {(t.common.businessTypes as Record<string, string>)[b.business_type]} ·{" "}
                    {a.since(formatDate(b.created_at, undefined, {}, intl))}
                  </p>
                </TableCell>
                <TableCell className="text-fg-muted">{b.owner_email ?? "—"}</TableCell>
                <TableCell className="text-sm whitespace-nowrap text-fg-muted">
                  {a.usage(
                    Number(b.member_count),
                    Number(b.staff_count),
                    Number(b.appointments_30d),
                  )}
                  {b.booking_enabled && (
                    <Badge tone="gold" className="ml-2">
                      {a.pageLive}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[b.status]}>{a.statuses[b.status] ?? b.status}</Badge>
                </TableCell>
                <TableCell>
                  <SubscriptionForm
                    businessId={b.id}
                    planId={subscriptionFor.get(b.id)?.plan_id ?? "basic"}
                    status={subscriptionFor.get(b.id)?.status ?? "trialing"}
                    plans={(plans ?? []).map((plan) => ({
                      id: plan.id,
                      name: t.common.plans[plan.id]?.name ?? plan.name,
                    }))}
                  />
                  {subscriptionFor.get(b.id)?.status === "trialing" &&
                    subscriptionFor.get(b.id)?.trial_ends_at && (
                      <p className="mt-1 text-xs text-fg-muted">
                        {a.trialUntil(
                          formatDate(
                            subscriptionFor.get(b.id)!.trial_ends_at!,
                            undefined,
                            {},
                            intl,
                          ),
                        )}
                      </p>
                    )}
                </TableCell>
                <TableCell>
                  <StatusForm businessId={b.id} status={b.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4 text-fg-muted" aria-hidden="true" /> {a.audit}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(events ?? []).length === 0 ? (
            <p className="text-sm text-fg-muted">{a.noEvents}</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(events ?? []).map((event) => (
                <li key={event.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                  <span>
                    <span className="font-semibold">{event.action}</span>
                    {event.business_id && (
                      <span className="text-fg-muted">
                        {" "}
                        · {names.get(event.business_id) ?? a.unknownBusiness}
                      </span>
                    )}
                    {typeof (event.metadata as { reason?: string })?.reason === "string" && (
                      <span className="text-fg-muted">
                        {" "}
                        · “{(event.metadata as { reason: string }).reason}”
                      </span>
                    )}
                  </span>
                  <span className="text-fg-muted">
                    {formatDateTime(event.created_at, undefined, intl)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
