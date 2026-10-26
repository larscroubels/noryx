import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { NEXT_STATUSES } from "@/lib/appointments/status";
import { formatLocalDate, formatMoney, formatTime } from "@/lib/format";
import { utcToZoned } from "@/lib/time";

import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { customerName, getAppointment, listStaff, recordedPayments } from "~/lib/appointments";
import { useWorkspace } from "~/lib/workspace";
import * as actions from "~/salon/actions";
import { CancelSheet, GiftCardSheet, PaymentSheet, RescheduleSheet } from "~/salon/sheets";
import { StatusBadge } from "~/salon/StatusBadge";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

type SheetName = "cancel" | "reschedule" | "payment" | "giftCard" | null;

export default function AppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, app, intl } = useT();
  const { business, can, staffId } = useWorkspace();
  const { userId } = useAccount();
  const queryClient = useQueryClient();
  const d = t.appointments.detail;
  const tz = business.timezone;
  const [sheet, setSheet] = useState<SheetName>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const query = useQuery({ queryKey: ["appointment", id], queryFn: () => getAppointment(id) });
  const staff = useQuery({
    queryKey: ["staff", business.id],
    queryFn: () => listStaff(business.id),
  });
  const paid = useQuery({
    queryKey: ["appointment", id, "payments"],
    queryFn: () => recordedPayments(id),
  });

  function refresh(message?: string) {
    setSheet(null);
    if (message) setNotice({ tone: "success", message });
    void queryClient.invalidateQueries({ queryKey: ["appointment", id] });
    void queryClient.invalidateQueries({ queryKey: ["appointments", business.id] });
  }

  const a = query.data;
  const title = <Stack.Screen options={{ headerShown: true, title: d.metaTitle }} />;
  if (query.isPending)
    return (
      <>
        {title}
        <Skeleton label={app.common.loading} lines={6} />
      </>
    );
  if (query.isError) {
    return (
      <>
        {title}
        <Screen scroll={false}>
          <ErrorState
            message={app.common.loadFailed}
            retryLabel={app.common.retry}
            onRetry={() => void query.refetch()}
          />
        </Screen>
      </>
    );
  }
  if (!a) {
    return (
      <>
        {title}
        <Screen>
          <EmptyState
            title={t.appointments.errors.gone}
            action={<Button onPress={() => router.back()}>{d.back}</Button>}
          />
        </Screen>
      </>
    );
  }

  const canManage =
    can("appointments.manage_all") || (can("appointments.manage_own") && staffId === a.staff_id);
  const canPay = canManage && can(["finance.manage", "appointments.manage_all"]);
  const canRedeem = can(["gift_cards.manage", "appointments.manage_all", "finance.manage"]);
  const local = utcToZoned(new Date(a.starts_at), tz);
  const name = customerName(a.customer, t.app.overview.customer);
  const money = (cents: number) => formatMoney(cents, a.currency, intl);

  async function status(next: (typeof NEXT_STATUSES)[keyof typeof NEXT_STATUSES][number]) {
    setBusy(next);
    setNotice(null);
    const result = await actions.changeStatus(a!.id, next, t);
    setBusy(null);
    if (result.ok) refresh(t.common.appointmentStatus[next]);
    else setNotice({ tone: "danger", message: result.message });
  }

  async function saveNote() {
    if (note === null) return;
    setBusy("note");
    const result = await actions.saveInternalNote(a!.id, note, t);
    setBusy(null);
    setNotice(
      result.ok
        ? { tone: "success", message: t.appointments.noteSaved }
        : { tone: "danger", message: result.message },
    );
    if (result.ok) {
      setNote(null);
      refresh();
    }
  }

  return (
    <>
      {title}
      <Screen
        refreshing={query.isRefetching}
        onRefresh={() => void queryClient.invalidateQueries({ queryKey: ["appointment", id] })}
      >
        {notice ? <Notice tone={notice.tone} message={notice.message} /> : null}

        <Card>
          <StatusBadge status={a.status} />
          <Text variant="title" accessibilityRole="header">
            {a.service_name}
          </Text>
          <Text>
            {formatLocalDate(local.date, { weekday: "long", day: "numeric", month: "long" }, intl)}
            {" · "}
            {formatTime(a.starts_at, tz, intl)}–{formatTime(a.ends_at, tz, intl)}
          </Text>
          {a.staff ? <Text color="fg-muted">{d.with(a.staff.display_name)}</Text> : null}
          <Text color="fg-muted">{a.source === "online" ? d.online : d.byTeam}</Text>
          {a.customer ? (
            <Button
              variant="secondary"
              onPress={() => router.push(`/salon/client/${a.customer!.id}`)}
            >
              {name}
            </Button>
          ) : null}
        </Card>

        <Card>
          <Text variant="heading">{d.details}</Text>
          <View style={styles.line}>
            <Text color="fg-muted">{d.priceAtBooking}</Text>
            <Text>{money(a.price_cents)}</Text>
          </View>
          {paid.data !== null && paid.data !== undefined ? (
            <View style={styles.line}>
              <Text color="fg-muted">{d.payment}</Text>
              <Text>{paid.data > 0 ? d.recorded(money(paid.data)) : d.notRecorded}</Text>
            </View>
          ) : null}
          {a.customer_note ? (
            <>
              <Text variant="label">{d.clientNote}</Text>
              <Text>{a.customer_note}</Text>
            </>
          ) : null}
          {a.status === "cancelled" ? (
            <Text color="fg-muted">
              {d.cancelledBy(a.cancelled_by === "customer")}. {a.cancellation_reason ?? d.noReason}
            </Text>
          ) : null}
        </Card>

        {canManage && a.status !== "cancelled" ? (
          <Card>
            {NEXT_STATUSES[a.status]
              .filter((s) => s !== "cancelled")
              .map((next) => (
                <Button
                  key={next}
                  variant={next === "confirmed" ? "primary" : "secondary"}
                  loading={busy === next}
                  onPress={() => void status(next)}
                  haptic
                >
                  {d.actions[next as keyof typeof d.actions] ?? t.common.appointmentStatus[next]}
                </Button>
              ))}
            <Button variant="secondary" onPress={() => setSheet("reschedule")}>
              {d.reschedule}
            </Button>
            {canPay ? (
              <Button variant="secondary" onPress={() => setSheet("payment")}>
                {t.finance.form.recordPayment}
              </Button>
            ) : null}
            {canRedeem ? (
              <Button variant="secondary" onPress={() => setSheet("giftCard")}>
                {t.giftCards.redeem.title}
              </Button>
            ) : null}
            {NEXT_STATUSES[a.status].includes("cancelled") ? (
              <Button variant="ghost" onPress={() => setSheet("cancel")}>
                {d.cancel}
              </Button>
            ) : null}
          </Card>
        ) : null}

        {canManage ? (
          <Card>
            <Field
              label={d.internalNote}
              value={note ?? a.internal_note ?? ""}
              onChangeText={setNote}
              multiline
            />
            {note !== null ? (
              <Button loading={busy === "note"} onPress={() => void saveNote()}>
                {t.common.save}
              </Button>
            ) : null}
          </Card>
        ) : null}
      </Screen>

      <CancelSheet
        appointment={a}
        visible={sheet === "cancel"}
        onClose={() => setSheet(null)}
        onDone={() => refresh(t.common.appointmentStatus.cancelled)}
      />
      <RescheduleSheet
        appointment={a}
        timeZone={tz}
        staff={staff.data ?? []}
        visible={sheet === "reschedule"}
        onClose={() => setSheet(null)}
        onDone={refresh}
      />
      {userId ? (
        <PaymentSheet
          appointment={a}
          userId={userId}
          visible={sheet === "payment"}
          onClose={() => setSheet(null)}
          onDone={refresh}
        />
      ) : null}
      <GiftCardSheet
        appointment={a}
        locale={intl}
        visible={sheet === "giftCard"}
        onClose={() => setSheet(null)}
        onDone={refresh}
      />
    </>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});
