import type { Database } from "@/types/database";

export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

/** Status changes a user may choose from the current status (mirrors validate_appointment_status). */
export const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: ["confirmed"],
  no_show: ["confirmed"],
  cancelled: [],
};

/** Statuses that occupy the professional's time. */
export const ACTIVE_STATUSES: AppointmentStatus[] = ["pending", "confirmed"];
