/**
 * NORYX permission model — mirrors public.permissions and public.role_permissions
 * (supabase/migrations/20261021120000_foundation.sql). tests/db/foundation.test.ts
 * fails if the two drift apart.
 *
 * The database is the authority: RLS policies call has_business_permission().
 * This module only exists so the UI can hide what a user cannot do and so the
 * server can fail fast with a friendly message before touching the database.
 */

/** Keys mirror public.permissions; the descriptions shown in the UI live in `team.permissions`. */
export const PERMISSIONS = {
  "settings.manage":
    "Edit the business profile, branding, locations, opening hours and booking policies",
  "members.manage": "Invite team members and change their roles and permissions",
  "staff.manage": "Manage all staff profiles, schedules and time off",
  "schedule.manage_own": "Manage your own working hours and time off",
  "services.manage": "Create and edit services, categories and prices",
  "appointments.view_all": "View every appointment in the business",
  "appointments.view_own": "View appointments assigned to you",
  "appointments.manage_all": "Create, reschedule and update any appointment",
  "appointments.manage_own": "Update appointments assigned to you",
  "customers.view": "View all customer records",
  "customers.manage": "Create, edit, export and delete customer records",
  "customers.notes": "Read and write private customer notes",
  "products.manage": "Manage retail products",
  "inventory.manage": "Adjust stock levels",
  "orders.manage": "View and process webshop orders",
  "finance.view": "View revenue, expenses and financial summaries",
  "finance.manage": "Record expenses and financial transactions",
  "reports.view": "View business reports",
  "billing.manage": "Manage the NORYX subscription and billing details",
  "audit.view": "View the business audit log",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export const MEMBER_ROLES = ["owner", "manager", "staff"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Default permissions per role. Owners implicitly hold every permission. */
export const ROLE_PERMISSIONS: Record<Exclude<MemberRole, "owner">, readonly Permission[]> = {
  manager: [
    "staff.manage",
    "schedule.manage_own",
    "services.manage",
    "appointments.view_all",
    "appointments.view_own",
    "appointments.manage_all",
    "appointments.manage_own",
    "customers.view",
    "customers.manage",
    "customers.notes",
    "products.manage",
    "inventory.manage",
    "orders.manage",
    "reports.view",
  ],
  staff: ["schedule.manage_own", "appointments.view_own", "appointments.manage_own"],
};

export type MemberAccess = {
  role: MemberRole;
  grantedPermissions?: readonly string[];
  revokedPermissions?: readonly string[];
};

/** Effective permissions: role defaults plus grants, minus revocations (owners: everything). */
export function effectivePermissions(member: MemberAccess): Set<Permission> {
  if (member.role === "owner") return new Set(ALL_PERMISSIONS);
  const granted = new Set<Permission>(ROLE_PERMISSIONS[member.role]);
  for (const key of member.grantedPermissions ?? []) {
    if (key in PERMISSIONS) granted.add(key as Permission);
  }
  for (const key of member.revokedPermissions ?? []) granted.delete(key as Permission);
  return granted;
}

export function hasPermission(
  permissions: ReadonlySet<string> | readonly string[],
  permission: Permission,
) {
  return Array.isArray(permissions)
    ? permissions.includes(permission)
    : (permissions as ReadonlySet<string>).has(permission);
}
