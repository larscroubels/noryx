import { Screen } from "~/ui/Screen";
import { Symbol } from "~/ui/Symbol";
import { Text } from "~/ui/Text";

export default function Index() {
  return (
    <Screen scroll={false}>
      <Symbol />
      <Text variant="display">NORYX</Text>
    </Screen>
  );
}
