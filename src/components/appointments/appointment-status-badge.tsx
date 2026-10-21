"use client";

import { CalendarCheck2, CircleCheckBig, CircleSlash, Clock3, UserX } from "lucide-react";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { useT } from "@/i18n/client";
import type { AppointmentStatus } from "@/lib/appointments/status";

const config: Record<AppointmentStatus, { tone: BadgeTone; icon: React.ReactNode }> = {
  pending: { tone: "warning", icon: <Clock3 /> },
  confirmed: { tone: "brand", icon: <CalendarCheck2 /> },
  completed: { tone: "success", icon: <CircleCheckBig /> },
  cancelled: { tone: "neutral", icon: <CircleSlash /> },
  no_show: { tone: "danger", icon: <UserX /> },
};

/** Status shown with icon + text so it never depends on colour alone. */
export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { tone, icon } = config[status];
  const t = useT();
  return (
    <Badge tone={tone} icon={icon}>
      {t.common.appointmentStatus[status]}
    </Badge>
  );
}
