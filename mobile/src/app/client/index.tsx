import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import { useT } from "~/i18n";
import { useAccount } from "~/lib/account-context";
import { useSession } from "~/lib/session";
import { SITE_URL } from "~/lib/supabase";
import { Button } from "~/ui/Button";
import { EmptyState } from "~/ui/EmptyState";
import { Screen } from "~/ui/Screen";

/** The client side arrives with plan C; until then this says so plainly. */
export default function ClientHome() {
  const { app } = useT();
  const { canSwitch, setSide } = useAccount();
  const { signOut } = useSession();
  return (
    <Screen>
      <EmptyState
        title={app.clientSoon.title}
        text={app.clientSoon.text}
        action={
          <Button
            variant="secondary"
            onPress={() => void WebBrowser.openBrowserAsync(`${SITE_URL}/signup`)}
          >
            {app.clientSoon.runSalon}
          </Button>
        }
      />
      {canSwitch ? (
        <Button
          onPress={() => {
            setSide("salon");
            router.replace("/salon");
          }}
        >
          {app.side.switchToSalon}
        </Button>
      ) : null}
      <Button variant="ghost" onPress={() => void signOut()}>
        {app.common.signOut}
      </Button>
    </Screen>
  );
}
