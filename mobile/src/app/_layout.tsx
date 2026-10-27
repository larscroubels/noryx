import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";

import { I18nProvider, useT } from "~/i18n";
import { AccountProvider } from "~/lib/account-context";
import { isAuthError, reportAuthFailure } from "~/lib/auth-failure";
import { SessionProvider, useSession } from "~/lib/session";
import { fontAssets } from "~/theme/fonts";
import { colors } from "~/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function Session({ client, children }: { client: QueryClient; children: ReactNode }) {
  const { app } = useT();
  return (
    <SessionProvider endedMessage={app.auth.sessionEnded} onSignedOut={() => client.clear()}>
      {children}
    </SessionProvider>
  );
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
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.screen },
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.screen },
      }}
    />
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // A refused session ends the sign-in instead of leaving every screen on "retry".
        queryCache: new QueryCache({ onError: (e) => isAuthError(e) && reportAuthFailure() }),
        mutationCache: new MutationCache({ onError: (e) => isAuthError(e) && reportAuthFailure() }),
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Session client={queryClient}>
          <AccountProvider>
            <Navigator />
          </AccountProvider>
        </Session>
      </I18nProvider>
    </QueryClientProvider>
  );
}
