import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Symbol } from "./Symbol";
import { Text } from "./Text";

/** Empty screen or list: what's missing and one clear next step. */
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Symbol size={48} />
      <Text variant="title" style={styles.center}>
        {title}
      </Text>
      {text ? (
        <Text color="fg-muted" style={styles.center}>
          {text}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12, paddingVertical: 32, paddingHorizontal: 24 },
  center: { textAlign: "center" },
});
