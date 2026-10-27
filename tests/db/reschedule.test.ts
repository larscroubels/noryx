import { beforeAll, describe, expect, it } from "vitest";

import { zonedTimeToUtc } from "@/lib/time";

import {
  addMember,
  as,
  createBusiness,
  createTestDatabase,
  createUser,
  type TestDatabase,
} from "./harness";

let db: TestDatabase;
let owner: string;
let staffUser: string;
let businessId: string;
let locationId: string;
let serviceId: string;
let anna: string;
let ben: string;
let customerId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });

/** A Wednesday two weeks ahead at a Brussels time (minutes after midnight). */
function wednesdayAt(minute: number) {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 14));
  while (date.getUTCDay() !== 3) date.setUTCDate(date.getUTCDate() + 1);
  return zonedTimeToUtc(date.toISOString().slice(0, 10), minute, "Europe/Brussels");
}

/** Inserts a confirmed 60-minute appointment with a 15-minute buffer. */
async function appointment(staffId: string, minute: number, status = "confirmed") {
  const starts = wednesdayAt(minute);
  const ends = new Date(starts.getTime() + 60 * 60_000);
  const blocked = new Date(ends.getTime() + 15 * 60_000);
  const { rows } = await db.query<{ id: string }>(
    `insert into public.appointments (business_id, location_id, staff_id, customer_id, service_id,
       service_name, duration_minutes, price_cents, currency, starts_at, ends_at, blocked_until, status)
     values ($1, $2, $3, $4, $5, 'Haircut', 60, 4500, 'EUR', $6, $7, $8, $9) returning id`,
    [businessId, locationId, staffId, customerId, serviceId, starts, ends, blocked, status],
  );
  return rows[0]!.id;
}

const reschedule = (by: string, id: string, staffId: string, startsAt: Date) =>
  as(
    db,
    user(by),
    (tx) =>
      tx.query("select public.reschedule_appointment($1, $2, $3)", [
        id,
        staffId,
        startsAt.toISOString(),
      ]),
    { commit: true },
  );

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  staffUser = await createUser(db, "Ben User");
  businessId = await createBusiness(db, owner, "studio-move", "Studio Move");
  await addMember(db, businessId, staffUser, "staff");
  locationId = (
    await db.query<{ id: string }>("select id from public.locations where business_id = $1", [
      businessId,
    ])
  ).rows[0]!.id;
  serviceId = (
    await db.query<{ id: string }>(
      "insert into public.services (business_id, name, duration_minutes, price_cents) values ($1, 'Haircut', 60, 4500) returning id",
      [businessId],
    )
  ).rows[0]!.id;
  const staff = async (name: string, userId: string | null) =>
    (
      await db.query<{ id: string }>(
        "insert into public.staff_members (business_id, location_id, display_name, user_id) values ($1, $2, $3, $4) returning id",
        [businessId, locationId, name, userId],
      )
    ).rows[0]!.id;
  customerId = (
    await db.query<{ id: string }>(
      "insert into public.customers (business_id, first_name) values ($1, 'Client') returning id",
      [businessId],
    )
  ).rows[0]!.id;
  anna = await staff("Anna", null);
  ben = await staff("Ben", staffUser);
});

describe("reschedule_appointment", () => {
  it("moves an appointment and keeps its buffer", async () => {
    const id = await appointment(anna, 540);
    const to = wednesdayAt(720);
    await reschedule(owner, id, ben, to);
    const { rows } = await db.query<{
      staff_id: string;
      starts_at: Date;
      ends_at: Date;
      blocked_until: Date;
    }>(
      "select staff_id, starts_at, ends_at, blocked_until from public.appointments where id = $1",
      [id],
    );
    expect(rows[0]!.staff_id).toBe(ben);
    expect(new Date(rows[0]!.starts_at).toISOString()).toBe(to.toISOString());
    expect(new Date(rows[0]!.ends_at).getTime() - to.getTime()).toBe(60 * 60_000);
    expect(new Date(rows[0]!.blocked_until).getTime() - to.getTime()).toBe(75 * 60_000);
  });

  it("refuses overlaps with 23P01", async () => {
    await appointment(anna, 900);
    const other = await appointment(anna, 1020);
    await expect(reschedule(owner, other, anna, wednesdayAt(930))).rejects.toMatchObject({
      code: "23P01",
    });
  });

  it("refuses cancelled appointments", async () => {
    const id = await appointment(anna, 600, "cancelled");
    await expect(reschedule(owner, id, anna, wednesdayAt(660))).rejects.toThrow(
      /Cancelled appointments cannot be rescheduled/,
    );
  });

  it("staff can't move someone else's appointment", async () => {
    const id = await appointment(anna, 480);
    await expect(reschedule(staffUser, id, anna, wednesdayAt(1080))).rejects.toThrow(
      /appointment_not_found/,
    );
  });

  it("staff can't hand their own appointment to a colleague", async () => {
    const id = await appointment(ben, 1140);
    await expect(reschedule(staffUser, id, anna, wednesdayAt(1140))).rejects.toMatchObject({
      code: "42501",
    });
    await reschedule(staffUser, id, ben, wednesdayAt(1200));
  });
});
