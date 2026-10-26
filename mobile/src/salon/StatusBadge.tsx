import { CalendarCheck2, CircleCheckBig, CircleSlash, Clock3, UserX } from "lucide-react-native";

import type { AppointmentStatus } from "@/lib/appointments/status";

import { useT } from "~/i18n";
import { colors } from "~/theme/tokens";
import { Badge, type BadgeTone } from "~/ui/Badge";

// Same tones and icons as the website's AppointmentStatusBadge.
const CONFIG: Record<AppointmentStatus, { tone: BadgeTone; Icon: typeof Clock3; color: string }> = {
  pending: { tone: "warning", Icon: Clock3, color: colors["warning-700"] },
  confirmed: { tone: "brand", Icon: CalendarCheck2, color: colors["pink-800"] },
  completed: { tone: "success", Icon: CircleCheckBig, color: colors["success-700"] },
  cancelled: { tone: "neutral", Icon: CircleSlash, color: colors["neutral-700"] },
  no_show: { tone: "danger", Icon: UserX, color: colors["danger-700"] },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useT();
  const { tone, Icon, color } = CONFIG[status];
  return (
    <Badge
      tone={tone}
      label={t.common.appointmentStatus[status]}
      icon={<Icon size={14} color={color} />}
    />
  );
}
