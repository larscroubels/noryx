import { fireEvent, render, screen } from "@testing-library/react-native";

import { ClientTabBar } from "./ClientTabBar";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const tabs = [
  { category: "hair" as const, salons: [{ businessId: "els", name: "Els", slug: "els" }] },
  {
    category: "nails" as const,
    salons: [
      { businessId: "vera", name: "Vera", slug: "vera" },
      { businessId: "kim", name: "Kim", slug: "kim" },
    ],
  },
];
const labels = {
  category: (c: string) => ({ hair: "Hairdresser", nails: "Nail stylist" })[c] ?? c,
  appointments: "Appointments",
  profile: "Profile",
};

it("shows one button per category with the salon name", async () => {
  const onSelect = jest.fn();
  await render(
    <ClientTabBar
      tabs={tabs}
      active={{ kind: "appointments" }}
      onSelect={onSelect}
      labels={labels}
    />,
  );
  expect(screen.getByText("Els")).toBeTruthy();
  // Several salons in one category: the category name.
  expect(screen.getByText("Nail stylist")).toBeTruthy();
  await fireEvent.press(screen.getByLabelText("Els, Hairdresser"));
  expect(onSelect).toHaveBeenCalledWith({ kind: "salon", category: "hair" });
});

it("marks the selected tab for screen readers", async () => {
  await render(
    <ClientTabBar
      tabs={tabs}
      active={{ kind: "salon", category: "nails" }}
      onSelect={jest.fn()}
      labels={labels}
    />,
  );
  expect(screen.getByLabelText("Nail stylist").props.accessibilityState).toMatchObject({
    selected: true,
  });
  expect(screen.getByLabelText("Els, Hairdresser").props.accessibilityState).toMatchObject({
    selected: false,
  });
});
