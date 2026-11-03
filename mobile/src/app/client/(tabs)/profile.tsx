import { router } from "expo-router";

import { ProfileContent } from "~/account/ProfileContent";
import { useT } from "~/i18n";
import { Button } from "~/ui/Button";

export default function ClientProfile() {
  const { app } = useT();
  return (
    <ProfileContent
      extra={
        <Button variant="secondary" onPress={() => router.push("/client/salons")}>
          {app.client.salons.title}
        </Button>
      }
    />
  );
}
