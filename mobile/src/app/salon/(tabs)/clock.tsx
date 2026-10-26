import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { formatLocalDate, formatTime } from "@/lib/format";
import { dayBoundsUtc, startOfWeek, todayInZone, addDays } from "@/lib/time";
import { entryDate, entryMinutes, hoursAndMinutes, weekDates } from "@/lib/time-clock";

import { useT } from "~/i18n";
import { supabase } from "~/lib/supabase";
import { useWorkspace } from "~/lib/workspace";
import { clockErrorMessage } from "~/salon/clock";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

/** Ticks once a minute so the running time stays current. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function Clock() {
  const { t, app, intl } = useT();
  const { business, staffId } = useWorkspace();
  const queryClient = useQueryClient();
  const c = t.timeClock;
  const tz = business.timezone;
  const now = useNow();
  const weekStart = startOfWeek(todayInZone(tz));
  const from = dayBoundsUtc(weekStart, tz).start.toISOString();
  const to = dayBoundsUtc(addDays(weekStart, 6), tz).end.toISOString();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );

  const entries = useQuery({
    queryKey: ["time", business.id, staffId, weekStart],
    queryFn: async () => {
      // The open entry may have started before this week.
      const { data, error } = await supabase
        .from("time_entries")
        .select("id, staff_id, clock_in, clock_out")
        .eq("business_id", business.id)
        .eq("staff_id", staffId!)
        .or(`clock_out.is.null,clock_in.gte.${from}`)
        .lt("clock_in", to)
        .order("clock_in", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(staffId),
  });

  if (!staffId) {
    return (
      <Screen>
        <EmptyState title={c.noProfile} />
      </Screen>
    );
  }

  const open = entries.data?.find((e) => e.clock_out === null) ?? null;
  const week = (entries.data ?? []).filter((e) => new Date(e.clock_in) >= new Date(from));
  const total = week.reduce((sum, e) => sum + entryMinutes(e, now), 0);

  async function toggle() {
    setBusy(true);
    setNotice(null);
    const { error } = await supabase.rpc(open ? "clock_out" : "clock_in", {
      p_business_id: business.id,
    });
    setBusy(false);
    if (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return setNotice({ tone: "danger", message: clockErrorMessage(error, t) });
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotice({ tone: "success", message: open ? c.clockedOutDone : c.clockedInDone });
    void queryClient.invalidateQueries({ queryKey: ["time", business.id] });
  }

  return (
    <Screen refreshing={entries.isRefetching} onRefresh={() => void entries.refetch()}>
      {notice ? <Notice tone={notice.tone} message={notice.message} /> : null}
      <Card>
        {entries.isPending ? (
          <Skeleton label={app.common.loading} lines={2} />
        ) : (
          <>
            <Text variant="title" accessibilityRole="header">
              {open ? c.clockedIn : c.clockedOut}
            </Text>
            {open ? (
              <Text color="fg-muted">
                {c.since(formatTime(open.clock_in, tz, intl))} ·{" "}
                {hoursAndMinutes(entryMinutes(open, now))}
              </Text>
            ) : null}
            <Button
              variant={open ? "secondary" : "primary"}
              loading={busy}
              onPress={() => void toggle()}
              haptic
            >
              {open ? c.clockOut : c.clockIn}
            </Button>
          </>
        )}
      </Card>

      <Card>
        <View style={styles.line}>
          <Text variant="heading" accessibilityRole="header">
            {c.myHours} · {c.thisWeek}
          </Text>
          <Text variant="heading">{hoursAndMinutes(total)}</Text>
        </View>
        {entries.isError ? (
          <ErrorState
            message={app.common.loadFailed}
            retryLabel={app.common.retry}
            onRetry={() => void entries.refetch()}
          />
        ) : week.length === 0 && !entries.isPending ? (
          <Text color="fg-muted">{c.noEntries}</Text>
        ) : (
          weekDates(weekStart).map((day) => {
            const minutes = week
              .filter((e) => entryDate(e, tz) === day)
              .reduce((sum, e) => sum + entryMinutes(e, now), 0);
            if (minutes === 0) return null;
            return (
              <View key={day} style={styles.line}>
                <Text>
                  {formatLocalDate(day, { weekday: "long", day: "numeric", month: "short" }, intl)}
                </Text>
                <Text>{hoursAndMinutes(minutes)}</Text>
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});
