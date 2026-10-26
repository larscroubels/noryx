import { useWorkspace } from "~/lib/workspace";
import { Screen } from "~/ui/Screen";
import { Text } from "~/ui/Text";

export default function Placeholder() {
  const { business } = useWorkspace();
  return (
    <Screen>
      <Text variant="title">{business.name}</Text>
    </Screen>
  );
}
