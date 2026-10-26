import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";

import { colors, radius } from "~/theme/tokens";

/** Loading placeholder; pulses unless Reduce Motion is on. */
export function Skeleton({ lines = 3, label }: { lines?: number; label: string }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  return (
    <View accessible accessibilityLabel={label} accessibilityRole="progressbar" style={styles.wrap}>
      {Array.from({ length: lines }, (_, i) => (
        <Animated.View
          key={i}
          style={[styles.line, { opacity, width: i === lines - 1 ? "60%" : "100%" }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, padding: 16 },
  line: { height: 16, borderRadius: radius.sm, backgroundColor: colors["neutral-100"] },
});
