import { describe, expect, it } from "vitest";

import { summarizeFinance } from "./summary";

describe("summarizeFinance", () => {
  const payments = [
    {
      amount_cents: 5800,
      status: "recorded" as const,
      method: "card",
      service_name: "Cut",
      staff_name: "Lena",
    },
    {
      amount_cents: 3400,
      status: "recorded" as const,
      method: "cash",
      service_name: "Men's cut",
      staff_name: "Amir",
    },
    {
      amount_cents: 5800,
      status: "recorded" as const,
      method: "card",
      service_name: "Cut",
      staff_name: "Amir",
    },
    {
      amount_cents: 9000,
      status: "refunded" as const,
      method: "card",
      service_name: "Colour",
      staff_name: "Lena",
    },
  ];
  const expenses = [
    { amount_cents: 12000, category: "products" },
    { amount_cents: 3000, category: "software" },
  ];
  const booked = [
    { price_cents: 5800, status: "completed" },
    { price_cents: 7000, status: "confirmed" },
    { price_cents: 4000, status: "cancelled" },
    { price_cents: 3000, status: "no_show" },
  ];

  it("separates recorded revenue, refunds, expenses and booked estimates", () => {
    const summary = summarizeFinance(payments, expenses, booked);
    expect(summary.revenueCents).toBe(15000);
    expect(summary.refundedCents).toBe(9000);
    expect(summary.expensesCents).toBe(15000);
    expect(summary.resultCents).toBe(0);
    expect(summary.bookedValueCents).toBe(12800);
    expect(summary.cancelledCount).toBe(1);
    expect(summary.noShowCount).toBe(1);
  });

  it("breaks recorded revenue down consistently with the total", () => {
    const summary = summarizeFinance(payments, expenses, booked);
    expect(summary.byService).toEqual([
      { label: "Cut", amountCents: 11600, count: 2 },
      { label: "Men's cut", amountCents: 3400, count: 1 },
    ]);
    for (const breakdown of [summary.byService, summary.byStaff, summary.byMethod]) {
      expect(breakdown.reduce((sum, row) => sum + row.amountCents, 0)).toBe(summary.revenueCents);
    }
  });
});
