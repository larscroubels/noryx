import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { formatLocalDate, formatMoney, formatTime } from "@/lib/format";
import { utcToZoned } from "@/lib/time";

import { cancelAppointment, myAppointments, type ClientAppointment } from "~/client/api";
import { splitAppointments } from "~/client/appointments";
import { bookingErrorMessage } from "~/client/errors";
import { useT } from "~/i18n";
import { StatusBadge } from "~/salon/StatusBadge";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Sheet } from "~/ui/Sheet";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

function Visit({
  visit,
  now,
  onCancel,
}: {
  visit: ClientAppointment;
  now: Date;
  onCancel?: (visit: ClientAppointment) => void;
}) {
  const { t, app, intl } = useT();
  const local = utcToZoned(new Date(visit.starts_at), visit.timezone);
  const upcoming = new Date(visit.starts_at).getTime() > now.getTime();
  const active = visit.status === "pending" || visit.status === "confirmed";
  return (
    <View style={styles.visit}>
      <StatusBadge status={visit.status} />
      <Text variant="heading">{visit.service_name}</Text>
      <Text>
        {formatLocalDate(local.date, { weekday: "long", day: "numeric", month: "long" }, intl)} ·{" "}
        {formatTime(visit.starts_at, visit.timezone, intl)}
      </Text>
      <Text color="fg-muted">
        {visit.business_name}
        {visit.staff_name ? ` · ${visit.staff_name}` : ""} ·{" "}
        {formatMoney(visit.price_cents, visit.currency, intl)}
      </Text>
      {upcoming && active ? (
        visit.can_cancel && onCancel ? (
          <Button variant="secondary" onPress={() => onCancel(visit)}>
            {t.appointments.detail.cancel}
          </Button>
        ) : (
          <Text variant="caption" color="fg-muted">
            {app.client.appointments.tooLate(visit.business_name)}
          </Text>
        )
      ) : null}
    </View>
  );
}

export default function Appointments() {
  const { t, app } = useT();
  const a = app.client.appointments;
  const queryClient = useQueryClient();
  const [now] = useState(() => new Date());
  const [cancelling, setCancelling] = useState<ClientAppointment | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );

  const query = useQuery({ queryKey: ["client", "appointments"], queryFn: myAppointments });

  async function cancel() {
    if (!cancelling) return;
    setBusy(true);
    const result = await cancelAppointment(cancelling.appointment_id);
    setBusy(false);
    setCancelling(null);
    if (result.ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNotice({ tone: "success", message: a.cancelled });
    } else {
      setNotice({ tone: "danger", message: bookingErrorMessage(result.error, t, app) });
    }
    void queryClient.invalidateQueries({ queryKey: ["client", "appointments"] });
  }

  if (query.isPending) return <Skeleton label={app.common.loading} lines={6} />;
  if (query.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState
          message={app.common.loadFailed}
          retryLabel={app.common.retry}
          onRetry={() => void query.refetch()}
        />
      </Screen>
    );
  }

  const { upcoming, history, previousSalons } = splitAppointments(query.data, now);
  const section = (title: string, rows: ClientAppointment[], text?: string) =>
    rows.length ? (
      <Card>
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        {text ? <Text color="fg-muted">{text}</Text> : null}
        {rows.map((visit) => (
          <Visit key={visit.appointment_id} visit={visit} now={now} onCancel={setCancelling} />
        ))}
      </Card>
    ) : null;

  return (
    <>
      <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        {notice ? <Notice tone={notice.tone} message={notice.message} /> : null}
        {query.data.length === 0 ? <EmptyState title={a.empty} text={a.emptyText} /> : null}
        {section(a.upcoming, upcoming)}
        {section(a.history, history)}
        {section(a.previousSalons, previousSalons, a.previousText)}
      </Screen>
      {cancelling ? (
        <Sheet
          visible
          onClose={() => setCancelling(null)}
          title={a.cancelTitle}
          closeLabel={app.common.close}
        >
          <Text>{a.cancelText(cancelling.business_name)}</Text>
          <Button variant="danger" loading={busy} onPress={() => void cancel()}>
            {a.cancelConfirm}
          </Button>
        </Sheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  visit: {
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "transparent",
  },
});
