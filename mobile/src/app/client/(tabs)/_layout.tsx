import { router, Tabs, useGlobalSearchParams } from "expo-router";
import type { ComponentProps } from "react";

import { ClientTabBar, type ClientTab } from "~/client/ClientTabBar";
import { categoryLabel, tabsFromLinks } from "~/client/links";
import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { fonts } from "~/theme/fonts";
import { colors } from "~/theme/tokens";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

function TabBar({ state }: TabBarProps) {
  const { t, app } = useT();
  const { account } = useAccount();
  const { category } = useGlobalSearchParams<{ category?: string }>();
  const tabs = tabsFromLinks(account?.links ?? []);
  const route = state.routes[state.index]!;
  const active: ClientTab =
    route.name === "appointments"
      ? { kind: "appointments" }
      : route.name === "profile"
        ? { kind: "profile" }
        : {
            kind: "salon",
            category:
              (tabs.find((tab) => tab.category === category) ?? tabs[0])?.category ?? "hair",
          };
  return (
    <ClientTabBar
      tabs={tabs}
      active={active}
      labels={{
        category: (c) => categoryLabel(c, t),
        appointments: app.client.tabs.appointments,
        profile: app.profile.title,
      }}
      onSelect={(tab) =>
        tab.kind === "salon"
          ? router.navigate({ pathname: "/client", params: { category: tab.category } })
          : router.navigate(
              tab.kind === "appointments" ? "/client/appointments" : "/client/profile",
            )
      }
    />
  );
}

/** Client side: one tab per category with linked salons, then appointments and profile. */
export default function ClientTabs() {
  const { app } = useT();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.screen },
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22, color: colors.fg },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.screen },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: app.client.tabs.book }} />
      <Tabs.Screen name="appointments" options={{ title: app.client.tabs.appointments }} />
      <Tabs.Screen name="profile" options={{ title: app.profile.title }} />
    </Tabs>
  );
}
