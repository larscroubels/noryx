import { Redirect } from "expo-router";

import { useSession } from "~/lib/session";
import { Button } from "~/ui/Button";
import { Screen } from "~/ui/Screen";
import { Symbol } from "~/ui/Symbol";
import { Text } from "~/ui/Text";

/** Entry point; signed-in users pick their side in the next step (Task 4). */
export default function Index() {
  const { status, session, signOut } = useSession();
  if (status !== "signedIn") return <Redirect href="/sign-in" />;
  return (
    <Screen scroll={false}>
      <Symbol />
      <Text variant="title">{session?.user.email}</Text>
      <Button variant="secondary" onPress={() => void signOut()}>
        Sign out
      </Button>
    </Screen>
  );
}
