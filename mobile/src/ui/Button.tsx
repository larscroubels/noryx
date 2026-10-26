import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { colors, radius, TOUCH, type ColorName } from "~/theme/tokens";

import { Text } from "./Text";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const LOOKS: Record<Variant, { box: ViewStyle; text: ColorName }> = {
  primary: { box: { backgroundColor: colors.primary }, text: "primary-fg" },
  secondary: {
    box: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors["border-strong"] },
    text: "fg",
  },
  danger: { box: { backgroundColor: colors["danger-600"] }, text: "white" },
  ghost: { box: { backgroundColor: "transparent" }, text: "pink-700" },
};

/** Pill button; at least 44 pt tall, busy while loading, optional haptic feedback. */
export function Button({
  children,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  haptic = false,
  icon,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
  style?: ViewStyle;
}) {
  const inactive = loading || disabled;
  const look = LOOKS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={() => {
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        look.box,
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={colors[look.text]} /> : icon}
        <Text variant="label" color={look.text}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  inactive: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
});
