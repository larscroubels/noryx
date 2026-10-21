"use server";

import { cookies } from "next/headers";

import { isLocale, LOCALE_COOKIE } from "./config";

/** Remembers the chosen interface language for a year. */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });
}
