import { EyeOff, Plus, Scissors } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getI18n, getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { formatDuration, formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).services.title };
}

export default async function ServicesPage({ searchParams }: PageProps<"/app/services">) {
  const params = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const sv = t.services;
  const { business } = workspace;
  const canManage = can(workspace, "services.manage");
  const supabase = await createClient();

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id, name, category_id, duration_minutes, price_cents, promo_price_cents, is_active, is_online_bookable, staff_services(staff_id)",
      )
      .eq("business_id", business.id)
      .order("sort_order")
      .order("name"),
    supabase
      .from("service_categories")
      .select("id, name")
      .eq("business_id", business.id)
      .order("sort_order")
      .order("name"),
  ]);

  const groups = [
    ...(categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      items: (services ?? []).filter((s) => s.category_id === category.id),
    })),
    {
      id: "none",
      name: categories && categories.length > 0 ? sv.other : sv.all,
      items: (services ?? []).filter((s) => !s.category_id),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={sv.title}
        description={sv.description}
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/app/services/new">
                <Plus aria-hidden="true" /> {sv.new}
              </Link>
            </Button>
          ) : undefined
        }
      />
      {typeof params.saved === "string" && (
        <Alert tone="success">{sv.saved(params.saved)}</Alert>
      )}
      {params.deleted === "1" && (
<Alert tone="success">{sv.deleted}</Alert>
      )}

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Scissors />}
            title={sv.empty}
            description={sv.emptyText}
            action={
              canManage ? (
                <Button asChild>
                  <Link href="/app/services/new">{sv.addFirst}</Link>
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        groups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="mb-3 eyebrow">
              {group.name}
            </h2>
            <Card>
              <ul className="divide-y divide-border">
                {group.items.map((service) => {
                  const body = (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{service.name}</span>
                          {!service.is_active && <Badge tone="neutral">{t.common.inactive}</Badge>}
                          {service.is_active && !service.is_online_bookable && (
                            <Badge tone="outline" icon={<EyeOff />}>
                              {sv.notOnline}
                            </Badge>
                          )}
                          {service.staff_services.length === 0 && (
                            <Badge tone="warning">{sv.noStaff}</Badge>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm text-fg-muted">
                          {formatDuration(service.duration_minutes, intl)} ·{" "}
                          {sv.professionals(service.staff_services.length)}
                        </span>
                      </span>
                      <span className="text-right text-sm font-semibold tabular-nums">
                        {service.promo_price_cents != null ? (
                          <>
                            <span className="text-pink-700">
                              {formatMoney(
                                service.promo_price_cents,
                                business.currency,
                                business.locale,
                              )}
                            </span>
                            <span className="ml-2 font-normal text-fg-muted line-through">
                              {formatMoney(service.price_cents, business.currency, business.locale)}
                            </span>
                          </>
                        ) : (
                          formatMoney(service.price_cents, business.currency, business.locale)
                        )}
                      </span>
                    </>
                  );
                  return (
                    <li key={service.id}>
                      {canManage ? (
                        <Link
                          href={`/app/services/${service.id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-surface-subtle sm:px-6"
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-4 sm:px-6">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        ))
      )}
    </div>
  );
}
