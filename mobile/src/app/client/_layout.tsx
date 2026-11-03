import { Redirect, Stack, useSegments } from "expo-router";

import { useAccount } from "~/lib/account-context";
import { colors } from "~/theme/tokens";

export default function ClientLayout() {
  const { account } = useAccount();
  const segments = useSegments() as string[];
  if (!account) return <Redirect href="/" />;
  // A client without linked salons starts by linking one.
  if (account.links.length === 0 && !segments.includes("onboarding")) {
    return <Redirect href="/client/onboarding" />;
  }
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}
    />
  );
}
