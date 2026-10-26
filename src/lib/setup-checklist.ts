/** Setup steps before a salon takes bookings; shared by the web dashboard and the app. */
export type SetupItem = {
  key: "hours" | "services" | "staff" | "publish";
  done: boolean;
  /** Workspace page where the step is completed. */
  href: string;
};

export function buildSetupChecklist(counts: {
  hours: number;
  services: number;
  workingHours: number;
  bookingEnabled: boolean;
}): SetupItem[] {
  return [
    { key: "hours", done: counts.hours > 0, href: "/app/settings#hours" },
    { key: "services", done: counts.services > 0, href: "/app/services" },
    { key: "staff", done: counts.workingHours > 0, href: "/app/staff" },
    { key: "publish", done: counts.bookingEnabled, href: "/app/settings#booking" },
  ];
}
