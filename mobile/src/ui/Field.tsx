import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { fonts } from "~/theme/fonts";
import { colors, radius, TOUCH } from "~/theme/tokens";

import { Text } from "./Text";

/** Labelled text input with hint and error, as on the website's forms. */
export function Field({
  label,
  error,
  hint,
  style,
  ...input
}: TextInputProps & { label: string; error?: string; hint?: string }) {
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        allowFontScaling
        placeholderTextColor={colors["fg-subtle"]}
        {...input}
        style={[styles.input, error ? styles.invalid : null, style]}
      />
      {error ? (
        <Text variant="caption" color="danger-700" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="fg-muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: TOUCH,
    borderWidth: 1,
    borderColor: colors["border-control"],
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.fg,
  },
  invalid: { borderColor: colors["danger-600"] },
});
