import { render, screen } from "@testing-library/react-native";

import { CategoryIcon } from "./CategoryIcon";

it("draws every category without throwing and hides it from screen readers", async () => {
  for (const category of ["hair", "nails", "beauty", "brows", "lashes", "other"] as const) {
    await render(<CategoryIcon category={category} size={24} color="#000" testID={category} />);
    expect(
      screen.getByTestId(category, { includeHiddenElements: true }).props
        .accessibilityElementsHidden,
    ).toBe(true);
  }
});
