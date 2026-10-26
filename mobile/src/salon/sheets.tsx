import { randomUUID } from "expo-crypto";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { PAYMENT_METHODS } from "@/lib/finance/summary";
import { formatMoney } from "@/lib/format";
import { timeToMinutes, utcToZoned, zonedTimeToUtc, minutesToTime } from "@/lib/time";
import { rescheduleSchema } from "@/lib/validation/appointment";
import { paymentSchema } from "@/lib/validation/finance";
import { giftCardRedeemSchema } from "@/lib/validation/gift-card";

import { useT } from "~/i18n";
import type { AppointmentDetail } from "~/lib/appointments";
import { fieldErrors, type FieldErrors } from "~/lib/form";
import { colors, radius, TOUCH } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Sheet } from "~/ui/Sheet";
import { Text } from "~/ui/Text";

import * as actions from "./actions";
import type { StaffOption } from "./StaffPicker";

type Done = (message?: string) => void;

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  async function run(task: () => Promise<actions.ActionResult>, done: Done) {
    setBusy(true);
    setFailure(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return setFailure(result.message);
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    done(result.message);
  }
  return { busy, failure, run };
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.chips} accessibilityRole="radiogroup">
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="radio"
          accessibilityState={{ selected: o.value === value }}
          onPress={() => onChange(o.value)}
          style={[styles.chip, o.value === value && styles.chipSelected]}
        >
          <Text variant="label" color={o.value === value ? "primary-fg" : "fg"}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function CancelSheet({
  appointment,
  visible,
  onClose,
  onDone,
}: {
  appointment: AppointmentDetail;
  visible: boolean;
  onClose: () => void;
  onDone: Done;
}) {
  const { t, app } = useT();
  const d = t.appointments.detail;
  const [reason, setReason] = useState("");
  const { busy, failure, run } = useSubmit();
  return (
    <Sheet visible={visible} onClose={onClose} title={d.cancelTitle} closeLabel={app.common.close}>
      <Text>{d.cancelText}</Text>
      {failure ? <Notice tone="danger" message={failure} /> : null}
      <Field
        label={t.common.fields.reason}
        hint={d.cancelReasonHint}
        value={reason}
        onChangeText={setReason}
        multiline
      />
      <Button
        variant="danger"
        loading={busy}
        onPress={() => run(() => actions.cancelByBusiness(appointment.id, reason, t), onDone)}
      >
        {d.cancelConfirm}
      </Button>
    </Sheet>
  );
}

export function RescheduleSheet({
  appointment,
  timeZone,
  staff,
  visible,
  onClose,
  onDone,
}: {
  appointment: AppointmentDetail;
  timeZone: string;
  staff: StaffOption[];
  visible: boolean;
  onClose: () => void;
  onDone: Done;
}) {
  const { t, app } = useT();
  const local = utcToZoned(new Date(appointment.starts_at), timeZone);
  const [date, setDate] = useState(local.date);
  const [time, setTime] = useState(minutesToTime(local.minuteOfDay));
  const [staffId, setStaffId] = useState(appointment.staff_id);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { busy, failure, run } = useSubmit();

  function submit() {
    const parsed = rescheduleSchema(t).safeParse({
      appointmentId: appointment.id,
      staffId,
      date: date.trim(),
      time: time.trim(),
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    const startsAt = zonedTimeToUtc(parsed.data.date, timeToMinutes(parsed.data.time), timeZone);
    void run(
      () =>
        actions.reschedule(
          { appointmentId: appointment.id, staffId, startsAt: startsAt.toISOString() },
          t,
        ),
      onDone,
    );
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t.appointments.detail.reschedule}
      closeLabel={app.common.close}
    >
      {failure ? <Notice tone="danger" message={failure} /> : null}
      <Field
        label={t.common.fields.date}
        hint="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        error={errors.date}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label={t.common.fields.time}
        hint="HH:MM"
        value={time}
        onChangeText={setTime}
        error={errors.time}
        keyboardType="numbers-and-punctuation"
      />
      <Text variant="label">{t.common.fields.professional}</Text>
      <Chips
        options={staff.map((s) => ({ value: s.id, label: s.display_name }))}
        value={staffId}
        onChange={setStaffId}
      />
      <Button loading={busy} onPress={submit} haptic>
        {t.appointments.detail.reschedule}
      </Button>
    </Sheet>
  );
}

export function PaymentSheet({
  appointment,
  userId,
  visible,
  onClose,
  onDone,
}: {
  appointment: AppointmentDetail;
  userId: string;
  visible: boolean;
  onClose: () => void;
  onDone: Done;
}) {
  const { t, app, intl } = useT();
  const [amount, setAmount] = useState(
    (appointment.price_cents / 100).toFixed(2).replace(".", ","),
  );
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number] | null>(null);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const { busy, failure, run } = useSubmit();

  function submit() {
    const parsed = paymentSchema(t).safeParse({
      appointmentId: appointment.id,
      amount,
      method: method ?? undefined,
      note,
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    if (!appointment.customer) return;
    void run(
      () =>
        actions.recordPayment(
          {
            businessId: appointment.business_id,
            appointmentId: appointment.id,
            customerId: appointment.customer!.id,
            currency: appointment.currency,
            amountCents: parsed.data.amount,
            method: parsed.data.method,
            note: parsed.data.note ?? "",
            userId,
          },
          t,
        ),
      onDone,
    );
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t.finance.form.recordPayment}
      closeLabel={app.common.close}
    >
      <Text color="fg-muted">{t.appointments.detail.paymentText}</Text>
      {failure ? <Notice tone="danger" message={failure} /> : null}
      <Field
        label={t.common.fields.amount}
        hint={formatMoney(appointment.price_cents, appointment.currency, intl)}
        value={amount}
        onChangeText={setAmount}
        error={errors.amount}
        keyboardType="decimal-pad"
      />
      <Chips
        options={PAYMENT_METHODS.map((m) => ({ value: m, label: t.finance.methods[m] ?? m }))}
        value={method}
        onChange={setMethod}
      />
      {errors.method ? (
        <Text variant="caption" color="danger-700">
          {errors.method}
        </Text>
      ) : null}
      <Field
        label={t.staff.timeOff.note}
        placeholder={t.finance.form.notePlaceholder}
        value={note}
        onChangeText={setNote}
        error={errors.note}
      />
      <Button loading={busy} onPress={submit} haptic>
        {t.finance.form.recordPayment}
      </Button>
    </Sheet>
  );
}

export function GiftCardSheet({
  appointment,
  locale,
  visible,
  onClose,
  onDone,
}: {
  appointment: AppointmentDetail;
  locale: string;
  visible: boolean;
  onClose: () => void;
  onDone: Done;
}) {
  const { t, app } = useT();
  const g = t.giftCards.redeem;
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  // One key per attempt, so a retried tap can't redeem twice.
  const [idempotencyKey] = useState(() => randomUUID());
  const [errors, setErrors] = useState<FieldErrors>({});
  const { busy, failure, run } = useSubmit();
  const money = (cents: number) => formatMoney(cents, appointment.currency, locale);

  function submit() {
    const parsed = giftCardRedeemSchema(t).safeParse({
      code,
      amount,
      appointmentId: appointment.id,
      idempotencyKey,
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    void run(
      () =>
        actions.redeemGiftCard(
          {
            businessId: appointment.business_id,
            appointmentId: appointment.id,
            code: parsed.data.code,
            amountCents: parsed.data.amount,
            idempotencyKey,
          },
          t,
          money,
        ),
      onDone,
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={g.title} closeLabel={app.common.close}>
      <Text color="fg-muted">{g.text}</Text>
      {failure ? <Notice tone="danger" message={failure} /> : null}
      <Field
        label={g.code}
        placeholder={g.codePlaceholder}
        value={code}
        onChangeText={setCode}
        error={errors.code}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Field
        label={g.amount}
        value={amount}
        onChangeText={setAmount}
        error={errors.amount ?? errors.form}
        keyboardType="decimal-pad"
      />
      <Button loading={busy} onPress={submit} haptic>
        {g.submit}
      </Button>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: TOUCH,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors["border-strong"],
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
