import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, radius, type ColorName } from "~/theme/tokens";

import { Text } from "./Text";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const TONES: Record<BadgeTone, { bg: ColorName; fg: ColorName }> = {
  neutral: { bg: "neutral-100", fg: "neutral-700" },
  brand: { bg: "pink-50", fg: "pink-800" },
  success: { bg: "success-50", fg: "success-700" },
  warning: { bg: "warning-50", fg: "warning-700" },
  danger: { bg: "danger-50", fg: "danger-700" },
  info: { bg: "info-50", fg: "info-700" },
};

/** Status chip: the label is always shown, so status never depends on colour alone. */
export function Badge({ tone, label, icon }: { tone: BadgeTone; label: string; icon?: ReactNode }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors[t.bg] }]}>
      {icon}
      <Text variant="caption" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
