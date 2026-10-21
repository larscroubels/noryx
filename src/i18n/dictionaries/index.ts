import type { Locale } from "../config";

import { en } from "./en";
import { nl } from "./nl";

export type Dictionary = typeof en;

/** Every Dutch section is typed by its English counterpart, so missing keys fail to compile. */
export const dictionaries: Record<Locale, Dictionary> = { en, nl };
