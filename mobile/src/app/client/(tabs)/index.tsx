import { useLocalSearchParams } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { BookingFlow } from "~/client/BookingFlow";
import { CategoryIcon } from "~/client/CategoryIcon";
import { categoryLabel, tabsFromLinks } from "~/client/links";
import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { colors, TOUCH } from "~/theme/tokens";
import { Card } from "~/ui/Card";
import { Screen } from "~/ui/Screen";
import { Text } from "~/ui/Text";

/** A salon tab: booking with that salon, or a choice when several salons share it. */
export default function SalonTab() {
  const { t, app } = useT();
  const { account } = useAccount();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const tabs = tabsFromLinks(account?.links ?? []);
  const tab = tabs.find((item) => item.category === category) ?? tabs[0];
  const [picked, setPicked] = useState<string | null>(null);
  if (!tab) return null;

  const salon =
    tab.salons.length === 1
      ? tab.salons[0]!
      : (tab.salons.find((s) => s.businessId === picked) ?? null);

  if (!salon) {
    return (
      <Screen>
        <Text variant="title" accessibilityRole="header">
          {app.client.chooseSalon(categoryLabel(tab.category, t))}
        </Text>
        <Card>
          {tab.salons.map((s) => (
            <Pressable
              key={s.businessId}
              accessibilityRole="button"
              onPress={() => setPicked(s.businessId)}
              style={styles.row}
            >
              <CategoryIcon category={tab.category} color={colors["fg-accent"]} />
              <Text variant="heading" style={styles.grow}>
                {s.name}
              </Text>
              <ChevronRight size={20} color={colors["fg-subtle"]} />
            </Pressable>
          ))}
        </Card>
      </Screen>
    );
  }

  // A new salon starts a fresh booking.
  return <BookingFlow key={salon.slug} slug={salon.slug} />;
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH + 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  grow: { flex: 1 },
});
