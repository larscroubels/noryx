import { fireEvent, render, screen } from "@testing-library/react-native";

import { Badge } from "./Badge";
import { Button } from "./Button";
import { ErrorState } from "./ErrorState";

it("Button shows busy and ignores presses while loading", async () => {
  const onPress = jest.fn();
  await render(
    <Button loading onPress={onPress}>
      Save
    </Button>,
  );
  const button = screen.getByRole("button");
  expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  await fireEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
});

it("Badge always shows its label", async () => {
  await render(<Badge tone="success" label="Confirmed" />);
  expect(screen.getByText("Confirmed")).toBeTruthy();
});

it("ErrorState calls onRetry", async () => {
  const onRetry = jest.fn();
  await render(<ErrorState message="Couldn't load" retryLabel="Try again" onRetry={onRetry} />);
  await fireEvent.press(screen.getByText("Try again"));
  expect(onRetry).toHaveBeenCalled();
});
