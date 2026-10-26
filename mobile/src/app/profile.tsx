import { router, Stack } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { LOCALE_LABELS, LOCALES } from "@/i18n/config";

import { useT } from "~/i18n";
import type { AppLocale } from "~/i18n/locale";
import { useAccount } from "~/lib/account-context";
import { useSession } from "~/lib/session";
import { colors, TOUCH } from "~/theme/tokens";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { Screen } from "~/ui/Screen";
import { Text } from "~/ui/Text";

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.choice}
    >
      <Text style={styles.grow}>{label}</Text>
      {selected ? <Check size={20} color={colors.primary} /> : null}
    </Pressable>
  );
}

export default function Profile() {
  const { app, t, override, setOverride } = useT();
  const { session, signOut } = useSession();
  const { account, canSwitch, setSide, businessId, setBusinessId } = useAccount();
  const p = app.profile;
  const user = session?.user;
  const memberships = account?.memberships ?? [];
  const languages: { value: AppLocale | null; label: string }[] = [
    { value: null, label: memberships.length ? app.language.salon : p.deviceLanguage },
    ...LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l].name })),
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: p.title }} />
      <Screen>
        <Card>
          <Text variant="heading">{String(user?.user_metadata?.full_name ?? "")}</Text>
          <Text color="fg-muted">{user?.email}</Text>
        </Card>

        <Card>
          <Text variant="heading" accessibilityRole="header">
            {app.language.title}
          </Text>
          <View accessibilityRole="radiogroup">
            {languages.map((l) => (
              <Choice
                key={l.value ?? "auto"}
                label={l.label}
                selected={override === l.value}
                onPress={() => setOverride(l.value)}
              />
            ))}
          </View>
        </Card>

        {memberships.length > 1 ? (
          <Card>
            <Text variant="heading" accessibilityRole="header">
              {p.business}
            </Text>
            <View accessibilityRole="radiogroup">
              {memberships.map((m) => (
                <Choice
                  key={m.business.id}
                  label={`${m.business.name} · ${t.common.roles[m.role]}`}
                  selected={m.business.id === businessId}
                  onPress={() => setBusinessId(m.business.id)}
                />
              ))}
            </View>
          </Card>
        ) : null}

        {canSwitch ? (
          <Card>
            <Button
              variant="secondary"
              onPress={() => {
                setSide("salon");
                router.dismissTo("/salon");
              }}
            >
              {app.side.switchToSalon}
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                setSide("client");
                router.dismissTo("/client");
              }}
            >
              {app.side.switchToClient}
            </Button>
          </Card>
        ) : null}

        <Button variant="secondary" onPress={() => void signOut()}>
          {app.common.signOut}
        </Button>
        <Button variant="ghost" onPress={() => router.push("/delete-account")}>
          {t.account.delete.title}
        </Button>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: TOUCH,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  grow: { flex: 1 },
});
