import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { CheckCircle2, Circle } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { buildSetupChecklist } from "@/lib/setup-checklist";
import { dayBoundsUtc, todayInZone, utcToZoned } from "@/lib/time";

import { useT } from "~/i18n";
import { listAppointments, setupCounts } from "~/lib/appointments";
import { useWorkspace } from "~/lib/workspace";
import { openWorkspacePage } from "~/lib/open-workspace-page";
import { AppointmentRow } from "~/salon/AppointmentRow";
import { colors, TOUCH } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { Notice } from "~/ui/Notice";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

function greeting(minuteOfDay: number, g: { morning: string; afternoon: string; evening: string }) {
  if (minuteOfDay < 12 * 60) return g.morning;
  if (minuteOfDay < 18 * 60) return g.afternoon;
  return g.evening;
}

export default function Today() {
  const { t, app } = useT();
  const { business, can, staffId } = useWorkspace();
  const queryClient = useQueryClient();
  const o = t.app.overview;
  const tz = business.timezone;
  const today = todayInZone(tz);
  const { start, end } = dayBoundsUtc(today, tz);
  const showChecklist = can("settings.manage");
  const [linkFailed, setLinkFailed] = useState(false);

  const todays = useQuery({
    queryKey: ["appointments", business.id, "today", today],
    queryFn: () =>
      listAppointments({
        businessId: business.id,
        from: start.toISOString(),
        to: end.toISOString(),
      }),
  });
  const pending = useQuery({
    queryKey: ["appointments", business.id, "pending"],
    queryFn: () =>
      listAppointments({
        businessId: business.id,
        from: new Date().toISOString(),
        to: "9999-12-31T00:00:00Z",
        status: "pending",
      }),
  });
  const setup = useQuery({
    queryKey: ["setup", business.id],
    queryFn: () => setupCounts(business.id),
    enabled: showChecklist,
  });

  const checklist = setup.data
    ? buildSetupChecklist({ ...setup.data, bookingEnabled: business.booking_enabled })
    : [];
  const refreshing = todays.isRefetching || pending.isRefetching;

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() =>
        void queryClient.invalidateQueries({ queryKey: ["appointments", business.id] })
      }
    >
      <View style={styles.head}>
        <Text variant="display" accessibilityRole="header">
          {greeting(utcToZoned(new Date(), tz).minuteOfDay, o.greeting)}
        </Text>
        <Text color="fg-muted">{o.lead(business.name)}</Text>
      </View>

      {pending.data && pending.data.length > 0 ? (
        <Card>
          <Text variant="heading">{o.pending(pending.data.length)}</Text>
          {pending.data.slice(0, 5).map((a) => (
            <AppointmentRow key={a.id} appointment={a} timeZone={tz} showStaff />
          ))}
          <Button variant="secondary" onPress={() => router.push("/salon/calendar")}>
            {o.review}
          </Button>
        </Card>
      ) : null}

      <Card>
        <Text variant="heading" accessibilityRole="header">
          {o.schedule}
        </Text>
        {todays.isPending ? (
          <Skeleton label={app.common.loading} />
        ) : todays.isError ? (
          <ErrorState
            message={app.common.loadFailed}
            retryLabel={app.common.retry}
            onRetry={() => void todays.refetch()}
          />
        ) : todays.data.length === 0 ? (
          <EmptyState
            title={o.emptyTitle}
            text={business.booking_enabled ? o.emptyOnline : o.emptyOffline}
          />
        ) : (
          todays.data.map((a) => (
            <AppointmentRow key={a.id} appointment={a} timeZone={tz} showStaff />
          ))
        )}
      </Card>

      {staffId ? (
        <Button variant="secondary" onPress={() => router.push("/salon/clock")}>
          {app.tabs.clock}
        </Button>
      ) : null}

      {showChecklist && checklist.some((item) => !item.done) ? (
        <Card>
          <Text variant="heading" accessibilityRole="header">
            {o.finish}
          </Text>
          {linkFailed ? <Notice tone="danger" message={app.more.failed} /> : null}
          <Text color="fg-muted">
            {o.finishProgress(checklist.filter((i) => i.done).length, checklist.length)}
          </Text>
          {checklist.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="link"
              accessibilityLabel={`${o.checklist[item.key]} ${item.done ? o.done : o.todo}`}
              onPress={() => void openWorkspacePage(item.href).then((ok) => setLinkFailed(!ok))}
              style={styles.check}
            >
              {item.done ? (
                <CheckCircle2 size={20} color={colors["success-600"]} />
              ) : (
                <Circle size={20} color={colors["fg-subtle"]} />
              )}
              <Text style={styles.grow} color={item.done ? "fg-muted" : "fg"}>
                {o.checklist[item.key]}
              </Text>
            </Pressable>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4 },
  check: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: TOUCH },
  grow: { flex: 1 },
});
