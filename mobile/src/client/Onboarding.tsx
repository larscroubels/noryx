import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useT } from "~/i18n";
import { supabase } from "~/lib/supabase";
import { colors, radius, TOUCH } from "~/theme/tokens";
import { AuthLayout } from "~/ui/AuthLayout";
import { Button } from "~/ui/Button";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Text } from "~/ui/Text";

import { listLinks, normaliseCode, type ClientCategory } from "./api";
import { CategoryIcon } from "./CategoryIcon";
import { linkErrorMessage } from "./errors";
import { CATEGORY_ORDER, categoryLabel } from "./links";
import { linkCodes, type LinkOutcome } from "./manage-links";

type Step = "welcome" | "services" | "codes";

/** First run on the client side: choose services, then link each salon with its code. */
export function Onboarding({ email, onDone }: { email: string; onDone: () => void }) {
  const { t, app } = useT();
  const o = app.client.onboarding;
  const [step, setStep] = useState<Step>("welcome");
  const [chosen, setChosen] = useState<ClientCategory[]>([]);
  const [codes, setCodes] = useState<Partial<Record<ClientCategory, string>>>({});
  const [outcomes, setOutcomes] = useState<Map<string, LinkOutcome>>(new Map());
  const [busy, setBusy] = useState(false);
  const [resend, setResend] = useState<"idle" | "sent" | "failed">("idle");

  const toggle = (category: ClientCategory) =>
    setChosen((list) =>
      list.includes(category) ? list.filter((c) => c !== category) : [...list, category],
    );

  const outcomeFor = (category: ClientCategory) =>
    outcomes.get(normaliseCode(codes[category] ?? ""));
  const needsConfirmation = [...outcomes.values()].some(
    (r) => !r.ok && r.error === "email_not_confirmed",
  );
  const anyLinked = [...outcomes.values()].some((r) => r.ok);

  async function link() {
    setBusy(true);
    const entries = chosen.map((category) => ({ category, code: codes[category] ?? "" }));
    setOutcomes(await linkCodes(entries, await listLinks().catch(() => [])));
    setBusy(false);
  }

  async function resendEmail() {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResend(error ? "failed" : "sent");
  }

  if (step === "welcome") {
    return (
      <AuthLayout title={o.welcomeTitle} lead={o.welcomeText}>
        <Button onPress={() => setStep("services")}>{o.start}</Button>
      </AuthLayout>
    );
  }

  if (step === "services") {
    return (
      <AuthLayout title={o.servicesTitle} lead={o.servicesText}>
        <View accessibilityRole="list" style={styles.grid}>
          {CATEGORY_ORDER.map((category) => {
            const selected = chosen.includes(category);
            return (
              <Pressable
                key={category}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggle(category)}
                style={[styles.option, selected && styles.selected]}
              >
                <CategoryIcon
                  category={category}
                  color={selected ? colors["primary-fg"] : colors["fg-accent"]}
                />
                <Text variant="label" color={selected ? "primary-fg" : "fg"}>
                  {categoryLabel(category, t)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button disabled={chosen.length === 0} onPress={() => setStep("codes")}>
          {o.next}
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={o.codesTitle} lead={o.codesText}>
      {needsConfirmation ? (
        <>
          <Notice tone="info" message={t.auth.messages.confirmFirst} />
          {resend === "sent" ? <Notice tone="success" message={o.resent} /> : null}
          {resend === "failed" ? <Notice tone="danger" message={o.resendFailed} /> : null}
          <Button variant="secondary" onPress={() => void resendEmail()}>
            {o.resend}
          </Button>
        </>
      ) : null}
      {CATEGORY_ORDER.filter((c) => chosen.includes(c)).map((category) => {
        const result = outcomeFor(category);
        const label = categoryLabel(category, t);
        return (
          <View key={category} style={styles.code}>
            <Field
              label={o.codeLabel(label)}
              value={codes[category] ?? ""}
              onChangeText={(value) => setCodes((all) => ({ ...all, [category]: value }))}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="ATEL-7KQ2MX"
              error={
                result && !result.ok && result.error !== "email_not_confirmed"
                  ? linkErrorMessage(result.error, t, app)
                  : undefined
              }
            />
            {result?.ok ? (
              <Text variant="label" color="success-700">
                {o.linked(result.name)}
              </Text>
            ) : null}
          </View>
        );
      })}
      <Button
        loading={busy}
        disabled={!chosen.some((c) => (codes[c] ?? "").trim())}
        onPress={() => void link()}
        haptic
      >
        {o.link}
      </Button>
      {anyLinked ? (
        <Button variant="secondary" onPress={onDone}>
          {o.done}
        </Button>
      ) : null}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: TOUCH,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors["border-strong"],
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  code: { gap: 4 },
});
