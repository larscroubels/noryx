import type { Permission } from "@/lib/auth/permissions";

export type WorkspaceNavKey =
  | "overview"
  | "calendar"
  | "customers"
  | "services"
  | "staff"
  | "schedule"
  | "products"
  | "orders"
  | "team"
  | "finance"
  | "settings"
  | "help";

type NavDefinition = {
  key: WorkspaceNavKey;
  href: string;
  anyOf?: Permission[];
  exact?: boolean;
  hideIf?: Permission;
  /** Plan feature required to show the item. */
  feature?: string;
};

/** Workspace navigation; an item shows when the user holds any of its permissions. */
export const WORKSPACE_NAV: NavDefinition[] = [
  { key: "overview", href: "/app", exact: true },
  {
    key: "calendar",
    href: "/app/calendar",
    anyOf: ["appointments.view_all", "appointments.view_own"],
  },
  {
    key: "customers",
    href: "/app/customers",
    anyOf: ["customers.view", "appointments.view_own"],
  },
  { key: "services", href: "/app/services" },
  { key: "staff", href: "/app/staff", anyOf: ["staff.manage"] },
  {
    key: "schedule",
    href: "/app/schedule",
    anyOf: ["schedule.manage_own"],
    hideIf: "staff.manage",
  },
  {
    key: "products",
    href: "/app/products",
    anyOf: ["products.manage", "inventory.manage"],
    feature: "inventory",
  },
  {
    key: "orders",
    href: "/app/orders",
    anyOf: ["orders.manage"],
    feature: "shop",
  },
  {
    key: "finance",
    href: "/app/finance",
    anyOf: ["finance.view"],
    feature: "finance",
  },
  { key: "team", href: "/app/team", anyOf: ["members.manage"] },
  { key: "settings", href: "/app/settings", anyOf: ["settings.manage"] },
  { key: "help", href: "/app/help" },
];

export function visibleNav(permissions: ReadonlySet<string>, features?: ReadonlySet<string>) {
  return WORKSPACE_NAV.filter(
    (item) =>
      (!item.anyOf || item.anyOf.some((p) => permissions.has(p))) &&
      !(item.hideIf && permissions.has(item.hideIf)) &&
      (!item.feature || !features || features.has(item.feature)),
  );
}
