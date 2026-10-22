import { Download, Plus, Search, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getI18n, getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).customers.title };
}

const PAGE_SIZE = 25;

export default async function CustomersPage({ searchParams }: PageProps<"/app/customers">) {
  const params = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const c = t.customers;
  const { business } = workspace;
  const canManage = can(workspace, "customers.manage");
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const sort = params.sort === "name" ? "name" : "recent";
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone, created_at, source", { count: "exact" })
    .eq("business_id", business.id);
  if (q) {
    // Escape PostgREST filter syntax characters before building the OR filter.
    const term = q.replace(/[%_,()*\\]/g, " ").trim();
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
    );
  }
  query =
    sort === "name"
      ? query.order("first_name").order("last_name")
      : query.order("created_at", { ascending: false });
  const { data: customers, count } = await query.range(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE - 1,
  );
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) =>
    `/app/customers?${new URLSearchParams({ ...(q && { q }), sort, page: String(p) }).toString()}`;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={c.title}
        description={can(workspace, "customers.view") ? c.count(total) : c.ownOnly}
        actions={
          canManage ? (
            <>
              <Button asChild variant="secondary">
                <a href="/app/customers/export" download>
                  <Download aria-hidden="true" /> {c.exportCsv}
                </a>
              </Button>
              <Button asChild>
                <Link href="/app/customers/new">
                  <Plus aria-hidden="true" /> {c.add}
                </Link>
              </Button>
            </>
          ) : undefined
        }
      />

      <form method="get" className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="customer-search" className="sr-only">
            {c.searchLabel}
          </label>
          <Input
            id="customer-search"
            name="q"
            defaultValue={q}
            placeholder={c.searchPlaceholder}
            leading={<Search />}
            type="search"
          />
        </div>
        <label htmlFor="customer-sort" className="sr-only">
          {c.sort}
        </label>
        <Select id="customer-sort" name="sort" defaultValue={sort} className="sm:w-48">
          <option value="recent">{c.newest}</option>
          <option value="name">{c.byName}</option>
        </Select>
        <Button type="submit" variant="secondary">
          {t.common.search}
        </Button>
      </form>

      <Card className="overflow-hidden">
        {!customers || customers.length === 0 ? (
          <EmptyState
            icon={<UsersRound />}
            title={q ? c.noMatch : c.empty}
            description={q ? c.noMatchText : c.emptyText}
            action={
              canManage && !q ? (
                <Button asChild>
                  <Link href="/app/customers/new">{c.addOne}</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t.common.fields.name}</TableHead>
                  <TableHead className="hidden md:table-cell">{t.common.fields.email}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t.common.fields.phone}</TableHead>
                  <TableHead className="hidden lg:table-cell">{c.added}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Link
                          href={`/app/customers/${customer.id}`}
                          className="flex items-center gap-3 font-semibold hover:text-pink-700"
                        >
                          <Avatar name={name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate">{name}</span>
                            <span className="block truncate text-xs font-normal text-fg-muted md:hidden">
                              {customer.email}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden text-fg-muted md:table-cell">
                        {customer.email ?? "—"}
                      </TableCell>
                      <TableCell className="hidden text-fg-muted tabular-nums sm:table-cell">
                        {customer.phone ?? "—"}
                      </TableCell>
                      <TableCell className="hidden text-fg-muted lg:table-cell">
                        {formatDate(customer.created_at, business.timezone, {}, intl)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {pages > 1 && (
              <nav
                aria-label={t.common.pagination}
                className="flex items-center justify-between border-t border-border px-4 py-3 text-sm"
              >
                <span className="text-fg-muted">{t.common.pageOf(page, pages)}</span>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={link(page - 1)}>{t.common.previous}</Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      {t.common.previous}
                    </Button>
                  )}
                  {page < pages ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={link(page + 1)}>{t.common.next}</Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      {t.common.next}
                    </Button>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
