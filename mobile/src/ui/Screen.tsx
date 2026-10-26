import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { colors } from "~/theme/tokens";

/** Screen body on the ivory canvas; scrolls and supports pull to refresh. */
export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  if (!scroll) return <View style={[styles.fill, styles.pad]}>{children}</View>;
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={styles.pad}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.screen },
  pad: { padding: 16, gap: 16 },
});
