"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACTIVE_BUSINESS_COOKIE, getMemberships } from "@/lib/auth/session";

export async function switchBusiness(businessId: string) {
  const memberships = await getMemberships();
  if (!memberships.some((m) => m.business.id === businessId)) return;
  (await cookies()).set(ACTIVE_BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/app");
}
