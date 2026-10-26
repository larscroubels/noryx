import { beforeAll, describe, expect, it } from "vitest";

import { zonedTimeToUtc } from "@/lib/time";

import { as, createBusiness, createTestDatabase, createUser, type TestDatabase } from "./harness";

let db: TestDatabase;
let owner: string;
let businessId: string;
let locationId: string;
let serviceId: string;
let staffId: string;
let code: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });
const service = { role: "service_role" as const };

async function call<T = Record<string, unknown>>(
  userId: string,
  sql: string,
  params: unknown[] = [],
) {
  return as(
    db,
    user(userId),
    async (tx) => (await tx.query<{ result: T }>(sql, params)).rows[0]?.result as T,
    { commit: true },
  );
}

/** A Wednesday at least a week ahead, at a local Brussels time (minutes after midnight). */
let weeks = 1;
function wednesdayAt(minute: number) {
  const now = new Date();
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7 * weeks),
  );
  while (date.getUTCDay() !== 3) date.setUTCDate(date.getUTCDate() + 1);
  return zonedTimeToUtc(date.toISOString().slice(0, 10), minute, "Europe/Brussels");
}

type Appointment = {
  appointment_id: string;
  business_id: string;
  linked: boolean;
  status: string;
  can_cancel: boolean;
};
const myAppointments = (userId: string) =>
  call<Appointment[]>(
    userId,
    "select coalesce(jsonb_agg(a), '[]') as result from public.my_appointments() a",
  );
const bookAs = (userId: string, startsAt: Date) =>
  call<{ appointment_id: string; status: string }>(
    userId,
    "select public.client_book_appointment($1, $2, $3, $4) as result",
    [businessId, serviceId, staffId, startsAt.toISOString()],
  );
const linkedClient = async (name: string) => {
  const client = await createUser(db, name);
  const result = await call<{ error?: string }>(
    client,
    "select public.link_business_by_code($1, '{hair}'::public.client_category[]) as result",
    [code],
  );
  expect(result.error).toBeUndefined();
  return client;
};

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  businessId = await createBusiness(db, owner, "studio-client", "Studio Client");
  locationId = (
    await db.query<{ id: string }>("select id from public.locations where business_id = $1", [
      businessId,
    ])
  ).rows[0]!.id;
  await db.query(
    `update public.businesses set booking_enabled = true, booking_min_notice_minutes = 60,
       booking_buffer_minutes = 0, booking_cancellation_notice_hours = 24 where id = $1`,
    [businessId],
  );
  serviceId = (
    await db.query<{ id: string }>(
      "insert into public.services (business_id, name, duration_minutes, price_cents) values ($1, 'Haircut', 60, 4500) returning id",
      [businessId],
    )
  ).rows[0]!.id;
  staffId = (
    await db.query<{ id: string }>(
      "insert into public.staff_members (business_id, location_id, display_name) values ($1, $2, 'Anna') returning id",
      [businessId, locationId],
    )
  ).rows[0]!.id;
  await db.query(
    "insert into public.staff_services (business_id, staff_id, service_id) values ($1, $2, $3)",
    [businessId, staffId, serviceId],
  );
  await db.query(
    "insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute) values ($1, $2, 3, 540, 1080)",
    [businessId, staffId],
  );
  code = await call<string>(owner, "select public.ensure_connection_code($1) as result", [
    businessId,
  ]);
});

describe("client bookings", () => {
  it("books with the salon's own rules for a linked client", async () => {
    const client = await linkedClient("Booking Client");
    const booked = await bookAs(client, wednesdayAt(600));
    expect(booked.status).toBe("confirmed");
    const mine = await myAppointments(client);
    expect(mine).toEqual([
      expect.objectContaining({ appointment_id: booked.appointment_id, linked: true }),
    ]);
  });

  it("refuses booking without an active link", async () => {
    const client = await linkedClient("Unlinked Client");
    await call(client, "select public.unlink_business($1) as result", [businessId]);
    await expect(bookAs(client, wednesdayAt(660))).rejects.toThrow(/client_link_required/);
  });

  it("applies the existing booking rules", async () => {
    const client = await linkedClient("Early Bird");
    await expect(bookAs(client, wednesdayAt(300))).rejects.toThrow(/slot_unavailable/);
  });

  it("hides visits from before the link", async () => {
    const client = await createUser(db, "Old Regular");
    const email = (
      await db.query<{ email: string }>("select email from auth.users where id = $1", [client])
    ).rows[0]!.email;
    const old = await as(
      db,
      service,
      async (tx) =>
        (
          await tx.query<{ result: { appointment_id: string } }>(
            "select public.create_online_booking($1, $2, $3, $4, $5, 'Old', 'Regular', $6, '') as result",
            [businessId, locationId, serviceId, staffId, wednesdayAt(720).toISOString(), email],
          )
        ).rows[0]!.result,
      { commit: true },
    );
    await db.query(
      "update public.appointments set created_at = now() - interval '30 days' where id = $1",
      [old.appointment_id],
    );
    await call(
      client,
      "select public.link_business_by_code($1, '{hair}'::public.client_category[]) as result",
      [code],
    );
    expect(await myAppointments(client)).toEqual([]);
  });

  it("shows history and allows cancelling after unlinking", async () => {
    const client = await linkedClient("Moving Client");
    const booked = await bookAs(client, wednesdayAt(780));
    await call(client, "select public.unlink_business($1) as result", [businessId]);
    const mine = await myAppointments(client);
    expect(mine[0]).toMatchObject({
      appointment_id: booked.appointment_id,
      linked: false,
      can_cancel: true,
    });
    await call(client, "select public.client_cancel_appointment($1) as result", [
      booked.appointment_id,
    ]);
    expect((await myAppointments(client))[0]!.status).toBe("cancelled");
  });

  it("enforces the cancellation deadline", async () => {
    const client = await linkedClient("Late Canceller");
    const booked = await bookAs(client, wednesdayAt(840));
    await db.query(
      "update public.appointments set starts_at = now() + interval '3 hours', ends_at = now() + interval '4 hours', blocked_until = now() + interval '4 hours' where id = $1",
      [booked.appointment_id],
    );
    await expect(
      call(client, "select public.client_cancel_appointment($1) as result", [
        booked.appointment_id,
      ]),
    ).rejects.toThrow(/cancellation_deadline_passed/);
  });

  it("never shows or cancels someone else's appointments", async () => {
    const client = await linkedClient("Owner Of Visit");
    const booked = await bookAs(client, wednesdayAt(900));
    const stranger = await createUser(db, "Stranger");
    expect(await myAppointments(stranger)).toEqual([]);
    await expect(
      call(stranger, "select public.client_cancel_appointment($1) as result", [
        booked.appointment_id,
      ]),
    ).rejects.toThrow(/booking_not_found/);
  });

  it("limits bookings per hour", async () => {
    const client = await linkedClient("Busy Booker");
    weeks = 2;
    for (let i = 0; i < 6; i++) await bookAs(client, wednesdayAt(540 + i * 60));
    await expect(bookAs(client, wednesdayAt(1020))).rejects.toThrow(/too_many_bookings/);
    weeks = 1;
  });
});
