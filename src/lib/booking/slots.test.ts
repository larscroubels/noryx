import { describe, expect, it } from "vitest";

import type { PublicBusiness } from "./public-shape";
import { slotsForDay } from "./slots";

// Wednesday 2026-11-04; every weekday 09:00–12:00 (Brussels).
const hours = [3].map((weekday) => ({ weekday, start_minute: 540, end_minute: 720 }));

const business: PublicBusiness = {
  id: "b1",
  slug: "studio",
  name: "Studio",
  business_type: "hair_salon",
  description: null,
  email: null,
  phone: null,
  website_url: null,
  instagram_handle: null,
  timezone: "Europe/Brussels",
  currency: "EUR",
  locale: "nl-BE",
  brand_color: null,
  logo_path: null,
  cover_path: null,
  policy: {
    min_notice_minutes: 0,
    horizon_days: 60,
    slot_interval_minutes: 60,
    buffer_minutes: 0,
    cancellation_notice_hours: 24,
    allow_staff_choice: true,
    requires_approval: false,
  },
  locations: [],
  categories: [],
  services: [
    {
      id: "cut",
      category_id: null,
      name: "Cut",
      description: null,
      duration_minutes: 60,
      price_cents: 4500,
      promo_price_cents: null,
      buffer_after_minutes: 0,
    },
  ],
  staff: ["anna", "ben"].map((id) => ({
    id,
    display_name: id,
    job_title: null,
    bio: null,
    location_id: null,
    services: [{ service_id: "cut", price_cents: null, duration_minutes: null }],
    hours,
  })),
};

const now = new Date("2026-11-01T08:00:00Z");
const base = { business, serviceId: "cut", date: "2026-11-04", now, locale: "en-GB" };

describe("slotsForDay", () => {
  it('merges professionals for "any"', () => {
    const slots = slotsForDay({ ...base, staffId: "any", busy: [] })!;
    expect(slots.map((s) => s.label)).toEqual(["09:00", "10:00", "11:00"]);
    expect(slots[0]!.staffIds.sort()).toEqual(["anna", "ben"]);
  });

  it("skips busy periods", () => {
    const busy = [
      { staff_id: "anna", starts_at: "2026-11-04T08:00:00Z", ends_at: "2026-11-04T09:00:00Z" },
    ];
    const slots = slotsForDay({ ...base, staffId: "anna", busy })!;
    expect(slots.map((s) => s.label)).toEqual(["10:00", "11:00"]);
  });

  it("labels slots in the salon's time zone", () => {
    const slots = slotsForDay({ ...base, staffId: "anna", busy: [] })!;
    // 09:00 in Brussels (UTC+1 in November) is 08:00 UTC, whatever the device's zone.
    expect(slots[0]).toMatchObject({ startsAt: "2026-11-04T08:00:00.000Z", label: "09:00" });
  });

  it("returns null for an unknown service", () => {
    expect(slotsForDay({ ...base, serviceId: "nope", staffId: "any", busy: [] })).toBeNull();
  });
});
