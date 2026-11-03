import { Stack } from "expo-router";

import { ProfileContent } from "~/account/ProfileContent";
import { useT } from "~/i18n";

export default function Profile() {
  const { app } = useT();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: app.profile.title }} />
      <ProfileContent />
    </>
  );
}
