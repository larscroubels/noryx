import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { PublicBusiness } from "./public-shape";

export { eligibleStaff, toWeekly, type PublicBusiness } from "./public-shape";

export const getPublicBusiness = cache(async (slug: string): Promise<PublicBusiness | null> => {
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_business", { p_slug: slug });
  if (error || !data) return null;
  return data as unknown as PublicBusiness;
});

/** Shape of public.get_public_gift_card_offer(). */
export type GiftCardOffer = {
  business_id: string;
  name: string;
  currency: string;
  locale: string;
  amounts: number[];
  allow_custom: boolean;
  min_cents: number;
  max_cents: number;
  validity_months: number | null;
  terms: string | null;
  phone: string | null;
};

/** What a salon sells as gift cards online, or null when it doesn't. */
export const getGiftCardOffer = cache(async (slug: string): Promise<GiftCardOffer | null> => {
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_gift_card_offer", { p_slug: slug });
  if (error || !data) return null;
  return data as unknown as GiftCardOffer;
});

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  in_stock: boolean;
  max_quantity: number;
};

/** Products for the click-and-collect shop (empty unless the shop is switched on). */
export const getPublicProducts = cache(async (slug: string): Promise<PublicProduct[]> => {
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_products", { p_slug: slug });
  if (error || !data) return [];
  return data as unknown as PublicProduct[];
});
