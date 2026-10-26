import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { formatLocalDate } from "@/lib/format";
import { addDays, dayBoundsUtc, isoWeekNumber, todayInZone } from "@/lib/time";

import { useT } from "~/i18n";
import { listAppointments, listStaff } from "~/lib/appointments";
import { groupByLocalDay, weekDays } from "~/lib/days";
import { useWorkspace } from "~/lib/workspace";
import { AppointmentRow } from "~/salon/AppointmentRow";
import { StaffPicker } from "~/salon/StaffPicker";
import { colors, radius, TOUCH } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

type View_ = "day" | "week";

export default function Calendar() {
  const { t, app, intl } = useT();
  const { business, can, staffId } = useWorkspace();
  const queryClient = useQueryClient();
  const c = t.appointments.calendar;
  const tz = business.timezone;
  const today = todayInZone(tz);
  const canSeeAll = can(["appointments.view_all", "appointments.manage_all"]);
  const [view, setView] = useState<View_>("day");
  const [date, setDate] = useState(today);
  const [staffFilter, setStaffFilter] = useState<string | null>(canSeeAll ? null : staffId);

  const days = view === "day" ? [date] : weekDays(date);
  const from = dayBoundsUtc(days[0]!, tz).start.toISOString();
  const to = dayBoundsUtc(days[days.length - 1]!, tz).end.toISOString();

  const staff = useQuery({
    queryKey: ["staff", business.id],
    queryFn: () => listStaff(business.id),
  });
  const appointments = useQuery({
    queryKey: ["appointments", business.id, "range", from, to, staffFilter],
    queryFn: () => listAppointments({ businessId: business.id, from, to, staffId: staffFilter }),
  });

  const step = (direction: -1 | 1) => setDate(addDays(date, direction * (view === "day" ? 1 : 7)));
  const groups = groupByLocalDay(appointments.data ?? [], tz);
  const title =
    view === "day"
      ? formatLocalDate(date, { weekday: "long", day: "numeric", month: "long" }, intl)
      : c.weekNumber(isoWeekNumber(date));

  return (
    <Screen
      refreshing={appointments.isRefetching}
      onRefresh={() =>
        void queryClient.invalidateQueries({ queryKey: ["appointments", business.id] })
      }
    >
      <View style={styles.segment} accessibilityRole="tablist" accessibilityLabel={c.viewLabel}>
        {(["day", "week"] as const).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === v }}
            onPress={() => setView(v)}
            style={[styles.segmentItem, view === v && styles.segmentSelected]}
          >
            <Text variant="label" color={view === v ? "primary-fg" : "fg"}>
              {c.views[v]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.common.previous}
          onPress={() => step(-1)}
          style={styles.arrow}
        >
          <ChevronLeft color={colors.fg} />
        </Pressable>
        <Text variant="title" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.common.next}
          onPress={() => step(1)}
          style={styles.arrow}
        >
          <ChevronRight color={colors.fg} />
        </Pressable>
      </View>
      {date !== today ? (
        <Button variant="ghost" onPress={() => setDate(today)}>
          {t.common.today}
        </Button>
      ) : null}

      {staff.data ? (
        <StaffPicker
          staff={staff.data}
          ownStaffId={staffId}
          canSeeAll={canSeeAll}
          value={staffFilter}
          onChange={setStaffFilter}
          allLabel={c.allStaff}
        />
      ) : null}

      {!canSeeAll && !staffId ? (
        <EmptyState title={c.notLinkedTitle} text={c.notLinkedText} />
      ) : appointments.isPending ? (
        <Skeleton label={app.common.loading} lines={5} />
      ) : appointments.isError ? (
        <ErrorState
          message={app.common.loadFailed}
          retryLabel={app.common.retry}
          onRetry={() => void appointments.refetch()}
        />
      ) : appointments.data.length === 0 ? (
        <EmptyState title={c.nothing} text={c.nothingText} />
      ) : (
        days
          .filter((day) => groups.has(day))
          .map((day) => (
            <Card key={day}>
              {view === "week" ? (
                <Text variant="heading" accessibilityRole="header">
                  {formatLocalDate(day, { weekday: "long", day: "numeric", month: "long" }, intl)}
                </Text>
              ) : null}
              {groups.get(day)!.map((a) => (
                <AppointmentRow key={a.id} appointment={a} timeZone={tz} showStaff={!staffFilter} />
              ))}
            </Card>
          ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    backgroundColor: colors["surface-muted"],
    borderRadius: radius.pill,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: TOUCH - 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  segmentSelected: { backgroundColor: colors.primary },
  stepper: { flexDirection: "row", alignItems: "center" },
  arrow: { minWidth: TOUCH, minHeight: TOUCH, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center" },
});
