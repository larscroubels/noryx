import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useState } from "react";

import { useT } from "~/i18n";
import { requestAccountDeletion } from "~/lib/delete-account";
import { useSession } from "~/lib/session";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import { Field } from "~/ui/Field";
import { Notice } from "~/ui/Notice";
import { Screen } from "~/ui/Screen";
import { Text } from "~/ui/Text";

/** Permanent account deletion (App Store requirement), with the website's typed confirmation. */
export default function DeleteAccount() {
  const { t, app } = useT();
  const { session, signOut } = useSession();
  const d = t.account.delete;
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setFailure(null);
    if (word.trim().toUpperCase() !== d.confirmWord) return setError(d.mismatch);
    setError(null);
    if (!session) return;
    setBusy(true);
    const outcome = await requestAccountDeletion(session.access_token);
    setBusy(false);
    if (outcome === "deleted") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await signOut(app.profile.deleted);
      return;
    }
    setFailure(outcome === "owns_business" ? d.ownerBlocked : d.failed);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: d.title }} />
      <Screen>
        <Card>
          <Text>{d.text}</Text>
          {failure ? <Notice tone="danger" message={failure} /> : null}
          <Field
            label={d.confirm(d.confirmWord)}
            value={word}
            onChangeText={setWord}
            error={error ?? undefined}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
          />
          <Button variant="danger" onPress={submit} loading={busy}>
            {d.button}
          </Button>
        </Card>
      </Screen>
    </>
  );
}
