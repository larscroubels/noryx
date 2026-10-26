import { StyleSheet, View } from "react-native";

import { Button } from "./Button";
import { Text } from "./Text";

/** A load failure: what went wrong and a retry. */
export function ErrorState({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.center}>{message}</Text>
      <Button variant="secondary" onPress={onRetry}>
        {retryLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 16, paddingVertical: 32, paddingHorizontal: 24 },
  center: { textAlign: "center" },
});
