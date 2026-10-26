import { Redirect } from "expo-router";

import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { useSession } from "~/lib/session";
import { ErrorState } from "~/ui/ErrorState";
import { Screen } from "~/ui/Screen";
import { Skeleton } from "~/ui/Skeleton";

/** Sends the user to sign-in, the salon side, the client side or the side picker. */
export default function Index() {
  const { status } = useSession();
  const account = useAccount();
  const { app } = useT();

  if (status !== "signedIn") return <Redirect href="/sign-in" />;
  if (account.status === "error") {
    return (
      <Screen scroll={false}>
        <ErrorState
          message={app.common.loadFailed}
          retryLabel={app.common.retry}
          onRetry={account.refetch}
        />
      </Screen>
    );
  }
  if (account.side === "salon") return <Redirect href="/salon" />;
  if (account.side === "client") return <Redirect href="/client" />;
  if (account.side === "pick") return <Redirect href="/pick-side" />;
  return <Skeleton label={app.common.loading} lines={4} />;
}
