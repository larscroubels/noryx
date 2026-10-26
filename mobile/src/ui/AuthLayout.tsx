import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Card } from "./Card";
import { Screen } from "./Screen";
import { Symbol } from "./Symbol";
import { Text } from "./Text";

/** Sign-in, sign-up and reset screens: the symbol, a title and the form on a card. */
export function AuthLayout({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Screen>
      <View style={styles.head}>
        <Symbol size={64} />
        <Text variant="display" accessibilityRole="header" style={styles.center}>
          {title}
        </Text>
        {lead ? (
          <Text color="fg-muted" style={styles.center}>
            {lead}
          </Text>
        ) : null}
      </View>
      <Card>{children}</Card>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: "center", gap: 8, paddingTop: 48, paddingBottom: 8 },
  center: { textAlign: "center" },
  footer: { alignItems: "center", gap: 4 },
});
