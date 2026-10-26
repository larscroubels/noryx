import { render, screen } from "@testing-library/react-native";

import { StaffPicker } from "./StaffPicker";

const staff = [
  { id: "a", display_name: "Anna" },
  { id: "b", display_name: "Ben" },
];

it("staff see only themselves in the picker", async () => {
  await render(
    <StaffPicker
      staff={staff}
      ownStaffId="b"
      canSeeAll={false}
      value="b"
      onChange={jest.fn()}
      allLabel="Everyone"
    />,
  );
  expect(screen.getByText("Ben")).toBeTruthy();
  expect(screen.queryByText("Anna")).toBeNull();
  expect(screen.queryByText("Everyone")).toBeNull();
});

it("managers see everyone", async () => {
  await render(
    <StaffPicker
      staff={staff}
      ownStaffId={null}
      canSeeAll
      value={null}
      onChange={jest.fn()}
      allLabel="Everyone"
    />,
  );
  expect(screen.getByText("Anna")).toBeTruthy();
  expect(screen.getByText("Ben")).toBeTruthy();
  expect(screen.getByText("Everyone")).toBeTruthy();
});
