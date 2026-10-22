export const admin = {
  metaTitle: "Platform admin",
  badge: "Platform admin",
  back: "Back to workspace",
  title: "Platform overview",
  description: "Usage across all NORYX businesses. Client records are never shown here.",
  statsLabel: "Platform statistics",
  stats: {
    businesses: "Businesses",
    active: "Active",
    new30: "New (30 days)",
    pagesLive: "Booking pages live",
    members: "Team members",
    appointments30: "Appointments (30 days)",
    online30: "Online bookings (30 days)",
    unsent30: "Unsent notifications (30 days)",
  },
  billingTitle: "Billing requires a payment-provider integration",
  billingText:
    "Plans and entitlements are assigned here and enforced in the database. No payment provider is connected, so nobody is charged and no invoices exist yet.",
  businesses: "Businesses",
  columns: {
    business: "Business",
    owner: "Owner",
    usage: "Usage",
    status: "Status",
    plan: "Plan",
    change: "Change status",
  },
  since: (date: string) => `since ${date}`,
  usage: (members: number, staff: number, bookings: number) =>
    `${members} ${members === 1 ? "member" : "members"} · ${staff} staff · ${bookings} bookings/30d`,
  pageLive: "Page live",
  trialUntil: (date: string) => `trial until ${date}`,
  statuses: { active: "Active", suspended: "Suspended", closed: "Closed" } as Record<
    string,
    string
  >,
  audit: "Audit log",
  noEvents: "No events yet.",
  unknownBusiness: "Unknown business",
  form: {
    subscriptionStatus: "Subscription status",
    trialing: "Trialing",
    reasonAudit: "Give a short reason (kept in the audit log).",
  },
  errors: {
    required: "Platform administrator access required.",
    status: "The status could not be changed.",
    plan: "The plan could not be changed.",
  },
  statusUpdated: "Status updated and recorded in the audit log.",
  planUpdated: "Plan updated and recorded in the audit log.",
};
