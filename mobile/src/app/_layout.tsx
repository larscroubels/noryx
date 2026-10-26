import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, type ReactNode } from "react";

import { I18nProvider, useT } from "~/i18n";
import { SessionProvider, useSession } from "~/lib/session";
import { fontAssets } from "~/theme/fonts";
import { colors } from "~/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function Session({ children }: { children: ReactNode }) {
  const { app } = useT();
  return <SessionProvider endedMessage={app.auth.sessionEnded}>{children}</SessionProvider>;
}

function Navigator() {
  const { status } = useSession();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = (fontsLoaded || Boolean(fontError)) && status !== "loading";

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}
    />
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <Session>
        <Navigator />
      </Session>
    </I18nProvider>
  );
}
