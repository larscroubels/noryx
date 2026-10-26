import * as WebBrowser from "expo-web-browser";

import { SITE_URL } from "./env";
import { supabase } from "./supabase";

/** One-time sign-in link from the website (POST /api/app/web-link), or null. */
export async function workspaceLink(
  path: string,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const response = await fetchImpl(`${SITE_URL}/api/app/web-link`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ next: path }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { url?: string };
    return typeof body.url === "string" && body.url.startsWith(SITE_URL) ? body.url : null;
  } catch {
    return null;
  }
}

/**
 * Opens a workspace page (e.g. "/app/settings#hours") in the in-app browser, signed in
 * when the website hands out a link; otherwise the page opens at sign-in.
 */
export async function openWorkspacePage(path: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const link = token ? await workspaceLink(path, token) : null;
  await WebBrowser.openBrowserAsync(link ?? `${SITE_URL}${path}`);
}
