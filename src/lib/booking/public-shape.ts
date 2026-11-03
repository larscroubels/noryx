import type { WeeklyRange } from "./availability";

/**
 * Public booking data shared by the website and the NORYX app (no server-only imports).
 */

/** Shape of public.get_public_business() — only public, non-personal data. */
export type PublicBusiness = {
  id: string;
  slug: string;
  name: string;
  business_type: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  timezone: string;
  currency: string;
  locale: string;
  brand_color: string | null;
  logo_path: string | null;
  cover_path: string | null;
  policy: {
    min_notice_minutes: number;
    horizon_days: number;
    slot_interval_minutes: number;
    buffer_minutes: number;
    cancellation_notice_hours: number;
    allow_staff_choice: boolean;
    requires_approval: boolean;
  };
  locations: {
    id: string;
    name: string;
    address_line1: string | null;
    address_line2: string | null;
    postal_code: string | null;
    city: string | null;
    country_code: string;
    phone: string | null;
    hours: { weekday: number; start_minute: number; end_minute: number }[];
  }[];
  categories: { id: string; name: string }[];
  services: {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    duration_minutes: number;
    price_cents: number;
    promo_price_cents: number | null;
    buffer_after_minutes: number;
  }[];
  staff: {
    id: string;
    display_name: string;
    job_title: string | null;
    bio: string | null;
    location_id: string | null;
    services: { service_id: string; price_cents: number | null; duration_minutes: number | null }[];
    hours: { weekday: number; start_minute: number; end_minute: number }[];
  }[];
};

export const toWeekly = (
  hours: { weekday: number; start_minute: number; end_minute: number }[],
): WeeklyRange[] =>
  hours.map((h) => ({ weekday: h.weekday, startMinute: h.start_minute, endMinute: h.end_minute }));

/** Professionals who perform the service, with their effective duration and price. */
export function eligibleStaff(business: PublicBusiness, serviceId: string) {
  const service = business.services.find((s) => s.id === serviceId);
  if (!service) return [];
  return business.staff.flatMap((member) => {
    const link = member.services.find((s) => s.service_id === serviceId);
    if (!link) return [];
    return [
      {
        ...member,
        durationMinutes: link.duration_minutes ?? service.duration_minutes,
        priceCents: link.price_cents ?? service.promo_price_cents ?? service.price_cents,
      },
    ];
  });
}
