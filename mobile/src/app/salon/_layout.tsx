import { Redirect, Stack } from "expo-router";

import { useAccount } from "~/lib/account-context";
import { WorkspaceProvider } from "~/lib/workspace";
import { fonts } from "~/theme/fonts";
import { colors } from "~/theme/tokens";

/** Salon side: the workspace for the whole stack — tabs plus detail screens pushed on top. */
export default function SalonLayout() {
  const { account, userId } = useAccount();
  if (!account || !userId) return <Redirect href="/" />;
  if (account.memberships.length === 0) return <Redirect href="/client" />;
  return (
    <WorkspaceProvider userId={userId} memberships={account.memberships}>
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.screen },
          headerTitleStyle: { fontFamily: fonts.semibold, color: colors.fg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.screen },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </WorkspaceProvider>
  );
}
