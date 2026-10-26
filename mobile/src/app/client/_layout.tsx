import { Redirect, Stack } from "expo-router";

import { useAccount } from "~/lib/account-context";
import { colors } from "~/theme/tokens";

export default function ClientLayout() {
  const { account } = useAccount();
  if (!account) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}
    />
  );
}
