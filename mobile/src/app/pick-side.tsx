import { router } from "expo-router";
import { Scissors, UserRound } from "lucide-react-native";

import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import type { Side } from "~/lib/side";
import { colors } from "~/theme/tokens";
import { AuthLayout } from "~/ui/AuthLayout";
import { Button } from "~/ui/Button";

/** Shown once to people who are both on a salon's team and a client somewhere. */
export default function PickSide() {
  const { app } = useT();
  const { setSide } = useAccount();

  function open(side: Side) {
    setSide(side);
    router.replace(side === "salon" ? "/salon" : "/client");
  }

  return (
    <AuthLayout title={app.side.pickTitle} lead={app.side.pickLead}>
      <Button
        onPress={() => open("salon")}
        icon={<Scissors size={18} color={colors["primary-fg"]} />}
        haptic
      >
        {app.side.salon}
      </Button>
      <Button
        variant="secondary"
        onPress={() => open("client")}
        icon={<UserRound size={18} color={colors.fg} />}
        haptic
      >
        {app.side.client}
      </Button>
    </AuthLayout>
  );
}
