import {
  Boxes,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Gift,
  Scissors,
  Settings,
  ShoppingBag,
  UserCog,
  Users,
  Wallet,
  CalendarClock,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { visibleNav, type WorkspaceNavKey } from "@/lib/navigation";

import { useT } from "~/i18n";
import { openWorkspacePage } from "~/lib/open-workspace-page";
import { useWorkspace } from "~/lib/workspace";
import { colors, TOUCH } from "~/theme/tokens";
import { Card } from "~/ui/Card";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Text } from "~/ui/Text";

/** Sections the app has natively; everything else opens the website. */
const NATIVE: WorkspaceNavKey[] = ["overview", "calendar", "customers", "time"];

const ICONS: Partial<Record<WorkspaceNavKey, typeof Settings>> = {
  services: Scissors,
  staff: Users,
  schedule: CalendarClock,
  products: Boxes,
  orders: ShoppingBag,
  giftCards: Gift,
  finance: Wallet,
  team: UserCog,
  settings: Settings,
  help: CircleHelp,
};

export default function More() {
  const { t, app } = useT();
  const { permissions } = useWorkspace();
  const [opening, setOpening] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const items = visibleNav(permissions).filter((item) => !NATIVE.includes(item.key));

  async function open(href: string) {
    setOpening(href);
    setFailed(false);
    try {
      setFailed(!(await openWorkspacePage(href)));
    } finally {
      setOpening(null);
    }
  }

  return (
    <Screen>
      <Text color="fg-muted">{app.more.lead}</Text>
      {failed ? <Notice tone="danger" message={app.more.failed} /> : null}
      <Card>
        {items.map((item) => {
          const Icon = ICONS[item.key] ?? ClipboardList;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="link"
              accessibilityLabel={t.app.nav[item.key]}
              accessibilityState={{ busy: opening === item.href }}
              disabled={opening !== null}
              onPress={() => void open(item.href)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Icon size={22} color={colors["fg-accent"]} />
              <Text variant="heading" style={styles.grow}>
                {t.app.nav[item.key]}
              </Text>
              {opening === item.href ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <ChevronRight size={20} color={colors["fg-subtle"]} />
              )}
            </Pressable>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH + 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  grow: { flex: 1 },
});
