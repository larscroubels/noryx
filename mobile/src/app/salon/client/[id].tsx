import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Mail, Phone } from "lucide-react-native";
import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { formatDateTime } from "@/lib/format";
import { noteSchema } from "@/lib/validation/customer";
import { databaseErrorMessage } from "@/lib/actions";

import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { addCustomerNote, customerAppointments, customerNotes, getCustomer } from "~/lib/customers";
import { fieldErrors, type FieldErrors } from "~/lib/form";
import { useWorkspace } from "~/lib/workspace";
import { AppointmentRow } from "~/salon/AppointmentRow";
import { colors } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { EmptyState } from "~/ui/EmptyState";
import { ErrorState } from "~/ui/ErrorState";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";
import { Text } from "~/ui/Text";

export default function ClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, app, intl } = useT();
  const { business, can } = useWorkspace();
  const { userId } = useAccount();
  const queryClient = useQueryClient();
  const d = t.customers.detail;
  const canNotes = can("customers.notes");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  // "Now" for splitting upcoming and past visits, fixed when the screen opens.
  const [now] = useState(() => Date.now());

  const customer = useQuery({ queryKey: ["customer", id], queryFn: () => getCustomer(id) });
  const visits = useQuery({
    queryKey: ["customer", id, "appointments"],
    queryFn: () => customerAppointments(id),
  });
  const notes = useQuery({
    queryKey: ["customer", id, "notes"],
    queryFn: () => customerNotes(id),
    enabled: canNotes,
  });

  const title = <Stack.Screen options={{ title: d.metaTitle }} />;
  if (customer.isPending)
    return (
      <>
        {title}
        <Skeleton label={app.common.loading} lines={6} />
      </>
    );
  if (customer.isError || !customer.data) {
    return (
      <>
        {title}
        <Screen scroll={false}>
          <ErrorState
            message={app.common.loadFailed}
            retryLabel={app.common.retry}
            onRetry={() => void customer.refetch()}
          />
        </Screen>
      </>
    );
  }

  const c = customer.data;
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  const upcoming = (visits.data ?? [])
    .filter((a) => new Date(a.starts_at).getTime() >= now)
    .reverse();
  const past = (visits.data ?? []).filter((a) => new Date(a.starts_at).getTime() < now);

  async function submitNote() {
    const parsed = noteSchema(t).safeParse({ customerId: id, body: note.trim() });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    if (!userId) return;
    setBusy(true);
    const { error } = await addCustomerNote({
      businessId: business.id,
      customerId: id,
      body: parsed.data.body,
      userId,
    });
    setBusy(false);
    if (error) return setNotice({ tone: "danger", message: databaseErrorMessage(error, t) });
    setNote("");
    setNotice({ tone: "success", message: t.customers.noteAdded });
    void queryClient.invalidateQueries({ queryKey: ["customer", id, "notes"] });
  }

  return (
    <>
      {title}
      <Screen>
        <Card>
          <Text variant="title" accessibilityRole="header">
            {name}
          </Text>
          <View style={styles.contact}>
            {c.phone ? (
              <Button
                variant="secondary"
                icon={<Phone size={18} color={colors.fg} />}
                onPress={() => void Linking.openURL(`tel:${c.phone!.replace(/\s/g, "")}`)}
              >
                {c.phone}
              </Button>
            ) : null}
            {c.email ? (
              <Button
                variant="secondary"
                icon={<Mail size={18} color={colors.fg} />}
                onPress={() => void Linking.openURL(`mailto:${c.email}`)}
              >
                {c.email}
              </Button>
            ) : null}
          </View>
        </Card>

        <Card>
          <Text variant="heading" accessibilityRole="header">
            {d.upcoming}
          </Text>
          {visits.isPending ? (
            <Skeleton label={app.common.loading} />
          ) : upcoming.length === 0 ? (
            <Text color="fg-muted">{t.appointments.calendar.nothing}</Text>
          ) : (
            upcoming.map((a) => (
              <AppointmentRow key={a.id} appointment={a} timeZone={business.timezone} showStaff />
            ))
          )}
        </Card>

        {past.length > 0 ? (
          <Card>
            <Text variant="heading" accessibilityRole="header">
              {d.history}
            </Text>
            {past.map((a) => (
              <AppointmentRow key={a.id} appointment={a} timeZone={business.timezone} showStaff />
            ))}
          </Card>
        ) : null}

        {canNotes ? (
          <Card>
            <Text variant="heading" accessibilityRole="header">
              {d.notes}
            </Text>
            <Text variant="caption" color="fg-muted">
              {d.notesText}
            </Text>
            {notice ? <Notice tone={notice.tone} message={notice.message} /> : null}
            <Field
              label={t.customers.form.newNote}
              value={note}
              onChangeText={setNote}
              error={errors.body}
              multiline
            />
            <Button loading={busy} onPress={() => void submitNote()}>
              {t.customers.form.addNote}
            </Button>
            {notes.data && notes.data.length === 0 ? <EmptyState title={d.notes} /> : null}
            {(notes.data ?? []).map((n) => (
              <View key={n.id} style={styles.note}>
                <Text variant="caption" color="fg-muted">
                  {formatDateTime(n.created_at, business.timezone, intl)}
                </Text>
                <Text>{n.body}</Text>
              </View>
            ))}
          </Card>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  contact: { gap: 8 },
  note: {
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
