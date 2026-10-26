import { Redirect, Stack } from "expo-router";

import { useSession } from "~/lib/session";
import { colors } from "~/theme/tokens";

export default function AuthLayout() {
  const { status } = useSession();
  if (status === "signedIn") return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}
    />
  );
}
