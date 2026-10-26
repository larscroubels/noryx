import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { formatTime } from "@/lib/format";

import { useT } from "~/i18n";
import { customerName, type AppointmentListItem } from "~/lib/appointments";
import { colors, TOUCH } from "~/theme/tokens";
import { Text } from "~/ui/Text";

import { StatusBadge } from "./StatusBadge";

/** One appointment in a list; opens the detail screen. */
export function AppointmentRow({
  appointment,
  timeZone,
  showStaff,
}: {
  appointment: AppointmentListItem;
  timeZone: string;
  showStaff?: boolean;
}) {
  const { t, intl } = useT();
  const time = `${formatTime(appointment.starts_at, timeZone, intl)}–${formatTime(appointment.ends_at, timeZone, intl)}`;
  const name = customerName(appointment.customer, t.app.overview.customer);
  const status = t.common.appointmentStatus[appointment.status];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${time}, ${name}, ${appointment.service_name}, ${status}`}
      onPress={() => router.push(`/salon/appointment/${appointment.id}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.time}>
        <Text variant="label">{formatTime(appointment.starts_at, timeZone, intl)}</Text>
        <Text variant="caption" color="fg-muted">
          {formatTime(appointment.ends_at, timeZone, intl)}
        </Text>
      </View>
      <View style={styles.body}>
        <Text variant="heading" numberOfLines={1}>
          {name}
        </Text>
        <Text color="fg-muted" numberOfLines={1}>
          {appointment.service_name}
          {showStaff && appointment.staff ? ` · ${appointment.staff.display_name}` : ""}
        </Text>
        <StatusBadge status={appointment.status} />
      </View>
      <ChevronRight size={20} color={colors["fg-subtle"]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  time: { width: 56 },
  body: { flex: 1, gap: 4 },
});
