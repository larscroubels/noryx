import * as WebBrowser from "expo-web-browser";

import { SITE_URL } from "./env";

/** Opens a page of the web workspace (e.g. "/app/settings#hours") in the in-app browser. */
export async function openWorkspacePage(path: string): Promise<void> {
  await WebBrowser.openBrowserAsync(`${SITE_URL}${path}`);
}
