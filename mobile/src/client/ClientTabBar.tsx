import { CalendarDays, CircleUserRound } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, TOUCH } from "~/theme/tokens";
import { Text } from "~/ui/Text";

import type { ClientCategory } from "./api";
import { CategoryIcon } from "./CategoryIcon";
import type { SalonTab } from "./links";

export type ClientTab =
  { kind: "salon"; category: ClientCategory } | { kind: "appointments" } | { kind: "profile" };

function TabButton({
  label,
  accessibilityLabel,
  selected,
  onPress,
  icon,
}: {
  label: string;
  accessibilityLabel: string;
  selected: boolean;
  onPress: () => void;
  icon: (color: string) => ReactNode;
}) {
  const color = selected ? colors.primary : colors["fg-muted"];
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.tab}
    >
      {icon(color)}
      <Text variant="caption" numberOfLines={1} style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * The client's tab bar: one tab per category they use (named after the salon, or the
 * category when several salons share it), then appointments and profile.
 */
export function ClientTabBar({
  tabs,
  active,
  onSelect,
  labels,
}: {
  tabs: SalonTab[];
  active: ClientTab;
  onSelect: (tab: ClientTab) => void;
  labels: { category: (category: ClientCategory) => string; appointments: string; profile: string };
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {tabs.map((tab) => {
          const category = labels.category(tab.category);
          const single = tab.salons.length === 1 ? tab.salons[0]!.name : null;
          return (
            <TabButton
              key={tab.category}
              label={single ?? category}
              accessibilityLabel={single ? `${single}, ${category}` : category}
              selected={active.kind === "salon" && active.category === tab.category}
              onPress={() => onSelect({ kind: "salon", category: tab.category })}
              icon={(color) => <CategoryIcon category={tab.category} color={color} />}
            />
          );
        })}
        <TabButton
          label={labels.appointments}
          accessibilityLabel={labels.appointments}
          selected={active.kind === "appointments"}
          onPress={() => onSelect({ kind: "appointments" })}
          icon={(color) => <CalendarDays size={24} color={color} />}
        />
        <TabButton
          label={labels.profile}
          accessibilityLabel={labels.profile}
          selected={active.kind === "profile"}
          onPress={() => onSelect({ kind: "profile" })}
          icon={(color) => <CircleUserRound size={24} color={color} />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: { flexGrow: 1, justifyContent: "space-around", paddingHorizontal: 4 },
  tab: {
    minWidth: 72,
    minHeight: TOUCH + 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
