import { router, Tabs } from "expo-router";
import { Pressable, type ColorValue } from "react-native";
import { CalendarDays, CircleUserRound, Clock, Menu, Sun, Users } from "lucide-react-native";

import { useT } from "~/i18n";
import { fonts } from "~/theme/fonts";
import { colors, TOUCH } from "~/theme/tokens";

export default function SalonTabs() {
  const { app } = useT();

  const tab = (title: string, Icon: typeof Sun) => ({
    title,
    tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
      <Icon color={String(color)} size={size} />
    ),
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors["fg-muted"],
        tabBarLabelStyle: { fontFamily: fonts.medium },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.screen },
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22, color: colors.fg },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.screen },
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={app.profile.open}
            onPress={() => router.push("/profile")}
            style={{
              minWidth: TOUCH,
              minHeight: TOUCH,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircleUserRound color={colors.fg} size={24} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen name="index" options={tab(app.tabs.today, Sun)} />
      <Tabs.Screen name="calendar" options={tab(app.tabs.calendar, CalendarDays)} />
      <Tabs.Screen name="clients" options={tab(app.tabs.clients, Users)} />
      <Tabs.Screen name="clock" options={tab(app.tabs.clock, Clock)} />
      <Tabs.Screen name="more" options={tab(app.tabs.more, Menu)} />
    </Tabs>
  );
}
