import * as WebBrowser from "expo-web-browser";

import { reportAuthFailure } from "./auth-failure";
import { openWorkspacePage } from "./open-workspace-page";

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn(async () => ({})) }));
jest.mock("./auth-failure", () => ({ reportAuthFailure: jest.fn() }));
jest.mock("./supabase", () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "tok" } } }) } },
}));

const respond = (status: number, body: unknown) =>
  jest.fn(async () => ({ ok: status < 300, status, json: async () => body })) as never;

beforeEach(() => jest.clearAllMocks());

it("never opens the website without a sign-in link", async () => {
  expect(await openWorkspacePage("/app/finance", respond(500, { ok: false }))).toBe(false);
  expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
});

it("reports a rejected session", async () => {
  expect(await openWorkspacePage("/app/finance", respond(401, { ok: false }))).toBe(false);
  expect(reportAuthFailure).toHaveBeenCalled();
});

it("opens the signed-in link", async () => {
  const url = `${process.env.EXPO_PUBLIC_SITE_URL ?? ""}/auth/confirm?token_hash=x`;
  expect(await openWorkspacePage("/app/finance", respond(200, { ok: true, url }))).toBe(true);
  expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url);
});
