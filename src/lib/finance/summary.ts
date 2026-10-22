import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Financial summaries computed from recorded rows. Recorded payments and
 * expenses are facts entered by the salon; booked appointment value is an
 * estimate and is always reported separately.
 */

export type PaymentRow = {
  amount_cents: number;
  status: "recorded" | "refunded";
  method: string;
  service_name: string | null;
  staff_name: string | null;
};

export type ExpenseRow = { amount_cents: number; category: string };

export type BookedRow = { price_cents: number; status: string };

export type Breakdown = { label: string; amountCents: number; count: number }[];

function groupBy<T>(rows: T[], key: (row: T) => string, amount: (row: T) => number): Breakdown {
  const map = new Map<string, { amountCents: number; count: number }>();
  for (const row of rows) {
    const label = key(row);
    const entry = map.get(label) ?? { amountCents: 0, count: 0 };
    entry.amountCents += amount(row);
    entry.count += 1;
    map.set(label, entry);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, ...value }))
    .sort((a, b) => b.amountCents - a.amountCents || a.label.localeCompare(b.label));
}

export function summarizeFinance(
  payments: PaymentRow[],
  expenses: ExpenseRow[],
  booked: BookedRow[],
) {
  const recorded = payments.filter((p) => p.status === "recorded");
  const refunded = payments.filter((p) => p.status === "refunded");
  const revenueCents = recorded.reduce((sum, p) => sum + p.amount_cents, 0);
  const refundedCents = refunded.reduce((sum, p) => sum + p.amount_cents, 0);
  const expensesCents = expenses.reduce((sum, e) => sum + e.amount_cents, 0);
  const countable = booked.filter((b) => b.status === "confirmed" || b.status === "completed");

  return {
    revenueCents,
    refundedCents,
    expensesCents,
    resultCents: revenueCents - expensesCents,
    paymentCount: recorded.length,
    bookedValueCents: countable.reduce((sum, b) => sum + b.price_cents, 0),
    cancelledCount: booked.filter((b) => b.status === "cancelled").length,
    noShowCount: booked.filter((b) => b.status === "no_show").length,
    byService: groupBy(
      recorded,
      (p) => p.service_name ?? "Not linked to an appointment",
      (p) => p.amount_cents,
    ),
    byStaff: groupBy(
      recorded,
      (p) => p.staff_name ?? "Not linked to a professional",
      (p) => p.amount_cents,
    ),
    byMethod: groupBy(
      recorded,
      (p) => p.method,
      (p) => p.amount_cents,
    ),
    expensesByCategory: groupBy(
      expenses,
      (e) => e.category,
      (e) => e.amount_cents,
    ),
  };
}

/** Labels live in the dictionaries under `finance.methods` and `finance.categories`. */
export const PAYMENT_METHODS = [
  "card",
  "bancontact",
  "cash",
  "bank_transfer",
  "voucher",
  "other",
] as const;

export const EXPENSE_CATEGORIES = [
  "products",
  "rent",
  "utilities",
  "salaries",
  "marketing",
  "equipment",
  "software",
  "training",
  "other",
] as const;

export const methodLabel = (t: Dictionary, value: string) => t.finance.methods[value] ?? value;
export const categoryLabel = (t: Dictionary, value: string) => t.finance.categories[value] ?? value;
