import { StyleSheet, View } from "react-native";

import { colors, radius, type ColorName } from "~/theme/tokens";

import { Text } from "./Text";

const TONES: Record<"info" | "success" | "danger", { bg: ColorName; fg: ColorName }> = {
  info: { bg: "info-50", fg: "info-700" },
  success: { bg: "success-50", fg: "success-700" },
  danger: { bg: "danger-50", fg: "danger-700" },
};

/** Inline message after an action (the website's FormAlert). Announced to screen readers. */
export function Notice({ tone, message }: { tone: keyof typeof TONES; message: string }) {
  const t = TONES[tone];
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === "danger" ? "alert" : "text"}
      style={[styles.box, { backgroundColor: colors[t.bg] }]}
    >
      <Text color={t.fg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, padding: 12 },
});
