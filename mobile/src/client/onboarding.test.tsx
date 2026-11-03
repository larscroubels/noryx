import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { dictionaries } from "@/i18n/dictionaries";

import { I18nProvider } from "~/i18n";
import { en as app } from "~/i18n/en";

import { Onboarding } from "./Onboarding";

const mockLink = jest.fn();
jest.mock("./api", () => ({
  ...jest.requireActual("./api"),
  linkSalon: (...args: unknown[]) => mockLink(...args),
  listLinks: async () => [],
}));
jest.mock("~/lib/supabase", () => ({
  supabase: { auth: { resend: jest.fn(async () => ({ error: null })) } },
}));
jest.mock("expo-localization", () => ({ getLocales: () => [{ languageTag: "en-GB" }] }));

const t = dictionaries.en;
const o = app.client.onboarding;

async function start(categories: string[]) {
  await render(
    <I18nProvider>
      <Onboarding email="client@example.com" onDone={jest.fn()} />
    </I18nProvider>,
  );
  await fireEvent.press(screen.getByText(o.start));
  for (const label of categories) await fireEvent.press(screen.getByText(label));
  await fireEvent.press(screen.getByText(o.next));
}

beforeEach(() => mockLink.mockReset());

it("asks to confirm the email before linking", async () => {
  mockLink.mockResolvedValue({ ok: false, error: "email_not_confirmed" });
  await start(["Hairdresser"]);
  await fireEvent.changeText(screen.getByLabelText(o.codeLabel("Hairdresser")), "ATEL-7KQ2MX");
  await act(async () => {
    await fireEvent.press(screen.getByText(o.link));
  });
  expect(screen.getByText(t.auth.messages.confirmFirst)).toBeTruthy();
  expect(screen.getByText(o.resend)).toBeTruthy();
  expect(screen.queryByText(o.done)).toBeNull();
});

it("shows the salon name after a valid code", async () => {
  mockLink.mockResolvedValue({ ok: true, businessId: "b1", name: "Atelier Noor", slug: "atelier" });
  await start(["Hairdresser"]);
  await fireEvent.changeText(screen.getByLabelText(o.codeLabel("Hairdresser")), "atel-7kq2mx");
  await act(async () => {
    await fireEvent.press(screen.getByText(o.link));
  });
  expect(screen.getByText(o.linked("Atelier Noor"))).toBeTruthy();
  expect(screen.getByText(o.done)).toBeTruthy();
});

it("links one salon once for two categories with the same code", async () => {
  mockLink.mockResolvedValue({ ok: true, businessId: "b1", name: "Atelier Noor", slug: "atelier" });
  await start(["Hairdresser", "Nail stylist"]);
  await fireEvent.changeText(screen.getByLabelText(o.codeLabel("Hairdresser")), "ATEL-7KQ2MX");
  await fireEvent.changeText(screen.getByLabelText(o.codeLabel("Nail stylist")), "atel-7kq2mx ");
  await act(async () => {
    await fireEvent.press(screen.getByText(o.link));
  });
  expect(mockLink).toHaveBeenCalledTimes(1);
  expect(mockLink).toHaveBeenCalledWith("ATEL-7KQ2MX", ["hair", "nails"]);
});
