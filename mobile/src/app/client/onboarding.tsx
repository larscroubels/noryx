import { router } from "expo-router";

import { finishOnboarding } from "~/client/finish-onboarding";
import { Onboarding } from "~/client/Onboarding";
import { useAccount } from "~/lib/account-context";
import { useSession } from "~/lib/session";

export default function ClientOnboarding() {
  const { session } = useSession();
  const { refetch } = useAccount();
  return (
    <Onboarding
      email={session?.user.email ?? ""}
      onDone={() => void finishOnboarding(refetch, () => router.replace("/client"))}
    />
  );
}
