import { CalendarPlus, Download, ShieldX, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { ConfirmAction } from "@/components/forms/confirm-action";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n, getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { requestTime } from "@/lib/time";

import { deleteCustomerNote, eraseCustomer } from "../actions";
import { CustomerForm, NoteForm } from "../customer-forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).customers.detail.metaTitle };
}

export default async function CustomerPage({
  params,
  searchParams,
}: PageProps<"/app/customers/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const d = t.customers.detail;
  const { business } = workspace;
  const tz = business.timezone;
  const supabase = await createClient();
  const canNotes = can(workspace, "customers.notes");
  const canManage = can(workspace, "customers.manage");

  const [{ data: customer }, { data: appointments }, { data: notes }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, marketing_opt_in, source, created_at")
      .eq("id", id)
      .eq("business_id", business.id)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select("id, starts_at, status, service_name, price_cents, staff:staff_members(display_name)")
      .eq("customer_id", id)
      .eq("business_id", business.id)
      .order("starts_at", { ascending: false })
      .limit(100),
    canNotes
      ? supabase
          .from("customer_notes")
          .select("id, body, created_at")
          .eq("customer_id", id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);
  if (!customer) notFound();

  const now = requestTime();
  const all = appointments ?? [];
  const upcoming = all
    .filter(
      (a) =>
        new Date(a.starts_at).getTime() >= now &&
        (a.status === "confirmed" || a.status === "pending"),
    )
    .reverse();
  const past = all.filter((a) => !upcoming.includes(a));
  const completed = all.filter((a) => a.status === "completed");
  const noShows = all.filter((a) => a.status === "no_show").length;
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");

  return (
    <div className="grid max-w-5xl gap-6">
      <PageHeader
        eyebrow={d.since(formatDate(customer.created_at, tz, {}, intl))}
        title={name}
        actions={
          <>
            {can(workspace, "appointments.manage_all") && (
              <Button asChild>
                <Link href={`/app/appointments/new?customer=${customer.id}`}>
                  <CalendarPlus aria-hidden="true" /> {d.book}
                </Link>
              </Button>
            )}
          </>
        }
      />
      {query.erased === "1" && (
<Alert tone="success">{d.erased}</Alert>
      )}

      <section aria-label={d.statistics} className="grid gap-4 sm:grid-cols-3">
        {[
          [d.completed, String(completed.length)],
          [d.noShows, String(noShows)],
          [
            d.value,
            formatMoney(
              completed.reduce((sum, a) => sum + a.price_cents, 0),
              business.currency,
              business.locale,
            ),
          ],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-fg-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{d.appointments}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {[
                [d.upcoming, upcoming],
                [d.history, past],
              ].map(([label, list]) => (
                <div key={label as string}>
                  <h3 className="mb-2 eyebrow">{label as string}</h3>
                  {(list as typeof all).length === 0 ? (
                    <p className="text-sm text-fg-muted">{t.common.none}</p>
                  ) : (
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {(list as typeof all).map((a) => (
                        <li key={a.id}>
                          <Link
                            href={`/app/appointments/${a.id}`}
                            className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm hover:bg-surface-subtle"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold">{a.service_name}</span>
                              <span className="block text-fg-muted">
                                {formatDateTime(a.starts_at, tz, intl)} · {a.staff?.display_name}
                              </span>
                            </span>
                            <AppointmentStatusBadge status={a.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {canNotes && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{d.notes}</CardTitle>
<CardDescription>{d.notesText}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5">
                <NoteForm customerId={customer.id} />
                {(notes ?? []).length > 0 && (
                  <ul className="grid gap-3">
                    {(notes ?? []).map((note) => (
                      <li
                        key={note.id}
                        className="flex gap-3 rounded-lg bg-surface-warm p-4 text-sm"
                      >
                        <div className="flex-1">
                          <p className="whitespace-pre-line">{note.body}</p>
                          <p className="mt-2 text-xs text-fg-muted">
                            {formatDateTime(note.created_at, tz, intl)}
                          </p>
                        </div>
                        <form action={deleteCustomerNote}>
                          <input type="hidden" name="id" value={note.id} />
                          <input type="hidden" name="customerId" value={customer.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={d.deleteNote}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{d.contact}</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerForm customer={customer} readOnly={!canManage} />
            </CardContent>
          </Card>
          {canManage && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{d.privacy}</CardTitle>
                  <CardDescription>{d.privacyText}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild variant="secondary">
                  <a href={`/app/customers/${customer.id}/export`}>
                    <Download aria-hidden="true" /> {d.exportData}
                  </a>
                </Button>
                <ConfirmAction
                  trigger={
                    <>
                      <ShieldX aria-hidden="true" /> {d.erase}
                    </>
                  }
                  title={d.eraseTitle(name)}
                  description={d.eraseText}
                  confirmLabel={d.eraseConfirm}
                  action={eraseCustomer}
                  hiddenFields={{ id: customer.id }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
