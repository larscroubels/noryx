import { describe, expect, it } from "vitest";

import { effectivePermissions } from "./auth/permissions";
import { visibleNav } from "./navigation";

const keys = (role: "owner" | "manager" | "staff") =>
  visibleNav(effectivePermissions({ role })).map((item) => item.key);

describe("role-aware navigation", () => {
  it("shows owners everything except the staff-only schedule shortcut", () => {
    expect(keys("owner")).toEqual([
      "overview",
      "calendar",
      "customers",
      "services",
      "staff",
      "products",
      "orders",
      "finance",
      "team",
      "settings",
      "help",
    ]);
  });

  it("hides settings, team and finance from managers by default", () => {
    expect(keys("manager")).toEqual([
      "overview",
      "calendar",
      "customers",
      "services",
      "staff",
      "products",
      "orders",
      "help",
    ]);
  });

  it("gives staff their own calendar, clients and schedule only", () => {
    expect(keys("staff")).toEqual([
      "overview",
      "calendar",
      "customers",
      "services",
      "schedule",
      "help",
    ]);
  });

  it("hides modules that are not included in the plan", () => {
    const owner = effectivePermissions({ role: "owner" });
    const keys = visibleNav(owner, new Set(["online_booking"])).map((item) => item.key);
    expect(keys).not.toContain("finance");
    expect(keys).not.toContain("orders");
    expect(keys).not.toContain("products");
    expect(keys).toContain("calendar");
  });
});
