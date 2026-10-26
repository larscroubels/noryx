import { useLocalSearchParams } from "expo-router";

import { Screen } from "~/ui/Screen";
import { Text } from "~/ui/Text";

/** Replaced by the full appointment screen in Task 7. */
export default function Appointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <Text>{id}</Text>
    </Screen>
  );
}
