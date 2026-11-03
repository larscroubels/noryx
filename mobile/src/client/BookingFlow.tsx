import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useReducer, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { eligibleStaff } from "@/lib/booking/public-shape";
import { busyRange, slotsForDay } from "@/lib/booking/slots";
import { formatLocalDate, formatMoney } from "@/lib/format";
import { addDays, daysBetween, todayInZone } from "@/lib/time";

import { useT } from "~/i18n";
import { colors, radius, TOUCH } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

import { bookAppointment, busyPeriods, publicBusiness } from "./api";
import { bookingReducer, initialBooking } from "./booking";
import { bookingErrorMessage } from "./errors";

function Choice({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}, ${detail}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
    >
      <View style={styles.grow}>
        <Text variant="heading">{title}</Text>
        {detail ? <Text color="fg-muted">{detail}</Text> : null}
      </View>
      <ChevronRight size={20} color={colors["fg-subtle"]} />
    </Pressable>
  );
}

/** Booking with one linked salon: the website's steps, rules and wording. */
export function BookingFlow({ slug }: { slug: string }) {
  const { t, app, intl } = useT();
  const f = t.booking.flow;
  const queryClient = useQueryClient();
  const [now] = useState(() => new Date());

  const business = useQuery({
    queryKey: ["public-business", slug],
    queryFn: () => publicBusiness(slug),
  });
  const b = business.data;
  const today = b ? todayInZone(b.timezone, now) : "";
  const [state, dispatch] = useReducer(bookingReducer, today, initialBooking);
  const date = state.date || today;
  const [busy, setBusy] = useState(false);

  const slots = useQuery({
    queryKey: ["slots", slug, state.serviceId, state.staffId, date, state.reloadTimes],
    enabled: Boolean(b && state.serviceId && state.staffId && state.step === "time"),
    queryFn: async () => {
      const range = busyRange(date, b!.timezone);
      const periods = await busyPeriods(b!.id, range.from, range.to);
      return slotsForDay({
        business: b!,
        serviceId: state.serviceId!,
        staffId: state.staffId!,
        date,
        busy: periods,
        now: new Date(),
        locale: intl,
      });
    },
  });

  if (business.isPending) return <Skeleton label={app.common.loading} lines={6} />;
  if (business.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState
          message={app.common.loadFailed}
          retryLabel={app.common.retry}
          onRetry={() => void business.refetch()}
        />
      </Screen>
    );
  }
  if (!b) return <EmptyState title={t.booking.errors.notAvailable} />;

  const money = (cents: number) => formatMoney(cents, b.currency, intl);
  const service = b.services.find((s) => s.id === state.serviceId) ?? null;
  const staff = state.serviceId ? eligibleStaff(b, state.serviceId) : [];
  const chosenStaff = staff.find(
    (s) => s.id === (state.staffId === "any" ? state.slot?.staffIds[0] : state.staffId),
  );
  const lastDay = addDays(today, b.policy.horizon_days);

  async function confirm() {
    if (!state.slot || !state.serviceId) return;
    setBusy(true);
    const staffId = state.staffId === "any" ? state.slot.staffIds[0]! : state.staffId!;
    const result = await bookAppointment({
      businessId: b!.id,
      serviceId: state.serviceId,
      staffId,
      startsAt: state.slot.startsAt,
      note: state.note,
    });
    setBusy(false);
    if (result.ok) {
      dispatch({ type: "booked", status: result.status });
      void queryClient.invalidateQueries({ queryKey: ["client", "appointments"] });
    } else {
      dispatch({
        type: "failed",
        error: result.error?.code === "23P01" ? "23P01" : (result.error?.message ?? ""),
        message: bookingErrorMessage(result.error, t, app),
      });
    }
  }

  const back =
    state.step !== "service" && state.step !== "done" ? (
      <Button variant="ghost" onPress={() => dispatch({ type: "back" })}>
        {t.common.back}
      </Button>
    ) : null;

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {b.name}
      </Text>
      {state.message ? <Notice tone="danger" message={state.message} /> : null}

      {state.step === "service" ? (
        <Card>
          <Text variant="heading">{f.chooseService}</Text>
          {b.services.length === 0 ? <Text color="fg-muted">{f.noServices}</Text> : null}
          {b.services.map((s) => (
            <Choice
              key={s.id}
              title={s.name}
              detail={`${s.duration_minutes} min · ${money(s.promo_price_cents ?? s.price_cents)}`}
              onPress={() =>
                dispatch({
                  type: "service",
                  serviceId: s.id,
                  allowStaffChoice: b.policy.allow_staff_choice,
                })
              }
            />
          ))}
        </Card>
      ) : null}

      {state.step === "staff" ? (
        <Card>
          <Text variant="heading">{f.whoTitle}</Text>
          <Choice
            title={f.anyAvailable}
            detail={f.mostTimes}
            onPress={() => dispatch({ type: "staff", staffId: "any" })}
          />
          {staff.map((s) => (
            <Choice
              key={s.id}
              title={s.display_name}
              detail={s.job_title ?? undefined}
              onPress={() => dispatch({ type: "staff", staffId: s.id })}
            />
          ))}
        </Card>
      ) : null}

      {state.step === "time" ? (
        <Card>
          <Text variant="heading">{f.pickTime}</Text>
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.common.previous}
              disabled={date <= today}
              onPress={() => dispatch({ type: "date", date: addDays(date, -1) })}
              style={[styles.arrow, date <= today && styles.disabled]}
            >
              <ChevronLeft color={colors.fg} />
            </Pressable>
            <Text variant="heading" style={styles.center}>
              {formatLocalDate(date, { weekday: "long", day: "numeric", month: "long" }, intl)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.common.next}
              disabled={daysBetween(date, lastDay) <= 0}
              onPress={() => dispatch({ type: "date", date: addDays(date, 1) })}
              style={[styles.arrow, daysBetween(date, lastDay) <= 0 && styles.disabled]}
            >
              <ChevronRight color={colors.fg} />
            </Pressable>
          </View>
          {slots.isPending ? (
            <Text color="fg-muted">{f.loadingTimes}</Text>
          ) : slots.isError ? (
            <ErrorState
              message={t.booking.errors.loadTimes}
              retryLabel={app.common.retry}
              onRetry={() => void slots.refetch()}
            />
          ) : !slots.data || slots.data.length === 0 ? (
            <Text color="fg-muted">
              {f.noTimes(
                formatLocalDate(date, { weekday: "long", day: "numeric", month: "long" }, intl),
              )}
            </Text>
          ) : (
            <View style={styles.slots}>
              {slots.data.map((slot) => (
                <Pressable
                  key={slot.startsAt}
                  accessibilityRole="button"
                  onPress={() => dispatch({ type: "slot", slot })}
                  style={styles.slot}
                >
                  <Text variant="label">{slot.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      ) : null}

      {state.step === "confirm" && service && state.slot ? (
        <Card>
          <Text variant="heading">{service.name}</Text>
          <Text>
            {f.when}:{" "}
            {formatLocalDate(date, { weekday: "long", day: "numeric", month: "long" }, intl)} ·{" "}
            {state.slot.label}
          </Text>
          <Text>
            {f.with}:{" "}
            {state.staffId === "any" ? f.anyProfessional : (chosenStaff?.display_name ?? "")}
          </Text>
          <Text>
            {money(chosenStaff?.priceCents ?? service.promo_price_cents ?? service.price_cents)} ·{" "}
            {f.payAtSalon}
          </Text>
          <Field
            label={f.notePrompt}
            placeholder={f.notePlaceholder}
            value={state.note}
            onChangeText={(note) => dispatch({ type: "note", note })}
            multiline
          />
          <Text variant="caption" color="fg-muted">
            {f.termsWithNotice(b.policy.cancellation_notice_hours, b.name)}
          </Text>
          <Text variant="caption" color="fg-muted">
            {f.noPayment}
          </Text>
          <Button loading={busy} onPress={() => void confirm()} haptic>
            {b.policy.requires_approval ? f.request : f.confirm}
          </Button>
        </Card>
      ) : null}

      {state.step === "done" ? (
        <Card>
          <Text variant="title">{state.result === "pending" ? f.requestReceived : f.booked}</Text>
          <Text>
            {state.result === "pending" ? f.pendingText(b.name) : f.confirmedText(b.name)}
          </Text>
          <Button onPress={() => router.navigate("/client/appointments")}>
            {app.client.tabs.appointments}
          </Button>
          <Button
            variant="secondary"
            onPress={() => dispatch({ type: "restart", date: todayInZone(b.timezone) })}
          >
            {app.client.bookAgain}
          </Button>
        </Card>
      ) : null}

      {back}
    </Screen>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: TOUCH + 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  grow: { flex: 1 },
  stepper: { flexDirection: "row", alignItems: "center" },
  arrow: { minWidth: TOUCH, minHeight: TOUCH, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.3 },
  center: { flex: 1, textAlign: "center" },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: {
    minWidth: 76,
    minHeight: TOUCH,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors["border-strong"],
    backgroundColor: colors.surface,
  },
});
