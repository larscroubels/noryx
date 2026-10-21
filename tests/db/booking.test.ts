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
let otherStaffUser: string;
let businessId: string;
let locationId: string;
let serviceId: string;
let annaId: string;
let benId: string;

const service = { role: "service_role" as const };
const user = (userId: string) => ({ role: "authenticated" as const, userId });

/** Next Wednesday at the given local time in Brussels, comfortably beyond minimum notice. */
function nextWednesdayAt(minute: number) {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7));
  while (date.getUTCDay() !== 3) date.setUTCDate(date.getUTCDate() + 1);
  return zonedTimeToUtc(date.toISOString().slice(0, 10), minute, "Europe/Brussels");
}

function book(staffId: string, startsAt: Date, email = "client@example.test") {
  return as(
    db,
    service,
    (tx) =>
      tx.query<{ result: { appointment_id: string; status: string } }>(
        `select public.create_online_booking($1, $2, $3, $4, $5, 'Client', 'Example', $6, '+32 470 00 00 00') as result`,
        [businessId, locationId, serviceId, staffId, startsAt.toISOString(), email],
      ),
    { commit: true },
  );
}

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  staffUser = await createUser(db, "Anna");
  otherStaffUser = await createUser(db, "Ben");
  businessId = await createBusiness(db, owner, "studio-booking", "Studio Booking");
  await addMember(db, businessId, staffUser, "staff");
  await addMember(db, businessId, otherStaffUser, "staff");

  const { rows: loc } = await db.query<{ id: string }>(
    "select id from public.locations where business_id = $1",
    [businessId],
  );
  locationId = loc[0]!.id;

  await db.query(
    `update public.businesses set booking_enabled = true, booking_min_notice_minutes = 60, booking_buffer_minutes = 0
     where id = $1`,
    [businessId],
  );
  const { rows: svc } = await db.query<{ id: string }>(
    `insert into public.services (business_id, name, duration_minutes, price_cents, buffer_after_minutes)
     values ($1, 'Haircut', 60, 4500, 15) returning id`,
    [businessId],
  );
  serviceId = svc[0]!.id;

  const { rows: staff } = await db.query<{ id: string; display_name: string }>(
    `insert into public.staff_members (business_id, location_id, user_id, display_name)
     values ($1, $2, $3, 'Anna'), ($1, $2, $4, 'Ben') returning id, display_name`,
    [businessId, locationId, staffUser, otherStaffUser],
  );
  annaId = staff.find((row) => row.display_name === "Anna")!.id;
  benId = staff.find((row) => row.display_name === "Ben")!.id;

  await db.query(
    `insert into public.staff_services (business_id, staff_id, service_id, price_cents)
     values ($1, $2, $4, null), ($1, $3, $4, 5000)`,
    [businessId, annaId, benId, serviceId],
  );
  for (const staffId of [annaId, benId]) {
    await db.query(
      `insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute)
       values ($1, $2, 3, 540, 1020)`,
      [businessId, staffId],
    );
  }
});

describe("public business page", () => {
  it("exposes the published catalogue to anonymous visitors without personal data", async () => {
    const { rows } = await as(db, { role: "anon" }, (tx) =>
      tx.query<{ page: Record<string, unknown> }>(
        "select public.get_public_business('studio-booking') as page",
      ),
    );
    const page = rows[0]!.page as { services: unknown[]; staff: { display_name: string }[] };
    expect(page.services).toHaveLength(1);
    expect(page.staff.map((member) => member.display_name)).toEqual(["Anna", "Ben"]);
    expect(JSON.stringify(page)).not.toContain("user_id");
  });

  it("returns nothing for unpublished or unknown businesses", async () => {
    const { rows } = await as(db, { role: "anon" }, (tx) =>
      tx.query<{ page: unknown }>("select public.get_public_business('does-not-exist') as page"),
    );
    expect(rows[0]!.page).toBeNull();
  });
});

describe("online booking", () => {
  it("creates a confirmed appointment with a service snapshot and outbox notifications", async () => {
    const { rows } = await book(annaId, nextWednesdayAt(10 * 60));
    const result = rows[0]!.result;
    expect(result.status).toBe("confirmed");

    const { rows: appt } = await db.query<{
      service_name: string;
      price_cents: number;
      blocked_until: Date;
      ends_at: Date;
    }>(
      "select service_name, price_cents, ends_at, blocked_until from public.appointments where id = $1",
      [result.appointment_id],
    );
    expect(appt[0]).toMatchObject({ service_name: "Haircut", price_cents: 4500 });
    expect(appt[0]!.blocked_until.getTime() - appt[0]!.ends_at.getTime()).toBe(15 * 60_000);

    const { rows: notes } = await db.query(
      "select template, status from public.notifications where appointment_id = $1 order by template",
      [result.appointment_id],
    );
    expect(notes).toEqual([
      { template: "booking_confirmed", status: "pending" },
      { template: "new_online_booking", status: "pending" },
    ]);
  });

  it("uses per-staff prices and reuses the existing customer record", async () => {
    const { rows } = await book(benId, nextWednesdayAt(10 * 60), "CLIENT@example.test");
    const { rows: appt } = await db.query<{ price_cents: number }>(
      "select price_cents from public.appointments where id = $1",
      [rows[0]!.result.appointment_id],
    );
    expect(appt[0]!.price_cents).toBe(5000);
    const { rows: customers } = await db.query(
      "select id from public.customers where business_id = $1",
      [businessId],
    );
    expect(customers).toHaveLength(1);
  });

  it("prevents double booking, including the buffer after an appointment", async () => {
    await expect(book(annaId, nextWednesdayAt(10 * 60), "second@example.test")).rejects.toThrow(
      /appointments_no_overlap/,
    );
    // 11:00 starts inside Anna's 15-minute buffer (10:00–11:15).
    await expect(book(annaId, nextWednesdayAt(11 * 60), "third@example.test")).rejects.toThrow(
      /appointments_no_overlap/,
    );
    await expect(
      book(annaId, nextWednesdayAt(11 * 60 + 15), "fourth@example.test"),
    ).resolves.toBeTruthy();
  });

  it("rejects slots outside working hours, off the slot grid or within the notice period", async () => {
    await expect(book(annaId, nextWednesdayAt(8 * 60))).rejects.toThrow(/slot_unavailable/);
    await expect(book(annaId, nextWednesdayAt(13 * 60 + 7))).rejects.toThrow(/invalid_slot/);
    await expect(book(annaId, new Date(Date.now() + 10 * 60_000))).rejects.toThrow(
      /outside_booking_window/,
    );
  });

  it("rejects bookings during time off", async () => {
    const start = nextWednesdayAt(14 * 60);
    await db.query(
      "insert into public.staff_time_off (business_id, staff_id, starts_at, ends_at) values ($1, $2, $3, $4)",
      [
        businessId,
        benId,
        start.toISOString(),
        new Date(start.getTime() + 2 * 3_600_000).toISOString(),
      ],
    );
    await expect(book(benId, start)).rejects.toThrow(/slot_unavailable/);
  });

  it("can only be called by the NORYX server, never directly by visitors", async () => {
    await expect(
      as(db, { role: "anon" }, (tx) =>
        tx.query(
          "select public.create_online_booking($1, $2, $3, $4, now(), 'A', 'B', 'a@b.co', null)",
          [businessId, locationId, serviceId, annaId],
        ),
      ),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("appointment access", () => {
  it("shows staff only their own appointments and only their own clients", async () => {
    const anna = await as(db, user(staffUser), (tx) =>
      tx.query<{ staff_id: string }>("select staff_id from public.appointments"),
    );
    expect(anna.rows.length).toBeGreaterThan(0);
    expect(anna.rows.every((row) => row.staff_id === annaId)).toBe(true);

    const ownerView = await as(db, user(owner), (tx) =>
      tx.query("select id from public.appointments"),
    );
    expect(ownerView.rows.length).toBeGreaterThan(anna.rows.length);
  });

  it("records status history and enforces allowed transitions", async () => {
    const { rows } = await db.query<{ id: string }>(
      "select id from public.appointments where staff_id = $1 limit 1",
      [annaId],
    );
    const id = rows[0]!.id;
    await as(
      db,
      user(staffUser),
      (tx) => tx.query("update public.appointments set status = 'completed' where id = $1", [id]),
      {
        commit: true,
      },
    );
    const { rows: events } = await db.query(
      "select event, from_status, to_status from public.appointment_events where appointment_id = $1 order by id",
      [id],
    );
    expect(events).toEqual([
      { event: "created", from_status: null, to_status: "confirmed" },
      { event: "status_changed", from_status: "confirmed", to_status: "completed" },
    ]);

    await expect(
      as(db, user(staffUser), (tx) =>
        tx.query("update public.appointments set status = 'pending' where id = $1", [id]),
      ),
    ).rejects.toThrow(/Cannot change an appointment/);
  });

  it("does not let staff change appointments of colleagues", async () => {
    const { rows } = await db.query<{ id: string }>(
      "select id from public.appointments where staff_id = $1 limit 1",
      [benId],
    );
    const result = await as(db, user(staffUser), (tx) =>
      tx.query("update public.appointments set internal_note = 'x' where id = $1", [rows[0]!.id]),
    );
    expect(result.affectedRows).toBe(0);
  });

  it("protects private customer notes behind their own permission", async () => {
    const { rows } = await db.query<{ id: string }>(
      "select id from public.customers where business_id = $1 limit 1",
      [businessId],
    );
    await as(
      db,
      user(owner),
      (tx) =>
        tx.query(
          "insert into public.customer_notes (business_id, customer_id, body, created_by) values ($1, $2, 'Allergic to latex', $3)",
          [businessId, rows[0]!.id, owner],
        ),
      { commit: true },
    );
    const staffNotes = await as(db, user(staffUser), (tx) =>
      tx.query("select body from public.customer_notes"),
    );
    expect(staffNotes.rows).toHaveLength(0);
    const ownerNotes = await as(db, user(owner), (tx) =>
      tx.query("select body from public.customer_notes"),
    );
    expect(ownerNotes.rows).toHaveLength(1);
  });
});

describe("client self-service", () => {
  async function tokenFor(startMinute: number, email: string) {
    const { rows } = await book(annaId, nextWednesdayAt(startMinute), email);
    const id = rows[0]!.result.appointment_id;
    const issued = await as(
      db,
      service,
      (tx) => tx.query<{ token: string }>("select public.issue_booking_token($1) as token", [id]),
      { commit: true },
    );
    return { id, token: issued.rows[0]!.token };
  }

  it("lets a client view and cancel their booking with the private link only", async () => {
    const { id, token } = await tokenFor(15 * 60, "selfservice@example.test");
    const view = await as(db, { role: "anon" }, (tx) =>
      tx.query<{ info: { service_name: string; can_cancel: boolean } }>(
        "select public.get_booking_by_token($1) as info",
        [token],
      ),
    );
    expect(view.rows[0]!.info).toMatchObject({ service_name: "Haircut", can_cancel: true });

    const wrong = await as(db, { role: "anon" }, (tx) =>
      tx.query<{ info: unknown }>("select public.get_booking_by_token('nope') as info"),
    );
    expect(wrong.rows[0]!.info).toBeNull();

    await as(
      db,
      { role: "anon" },
      (tx) => tx.query("select public.cancel_booking_by_token($1, 'Feeling unwell')", [token]),
      { commit: true },
    );
    const { rows } = await db.query<{ status: string; cancelled_by: string }>(
      "select status, cancelled_by from public.appointments where id = $1",
      [id],
    );
    expect(rows[0]).toEqual({ status: "cancelled", cancelled_by: "customer" });
  });

  it("enforces the cancellation deadline in the database", async () => {
    const { id, token } = await tokenFor(16 * 60, "late@example.test");
    await db.query(
      "update public.businesses set booking_cancellation_notice_hours = 336 where id = $1",
      [businessId],
    );
    await expect(
      as(db, { role: "anon" }, (tx) =>
        tx.query("select public.cancel_booking_by_token($1)", [token]),
      ),
    ).rejects.toThrow(/cancellation_deadline_passed/);
    await db.query(
      "update public.businesses set booking_cancellation_notice_hours = 24 where id = $1",
      [businessId],
    );
    expect(id).toBeTruthy();
  });

  it("never lets visitors issue tokens themselves", async () => {
    await expect(
      as(db, { role: "anon" }, (tx) =>
        tx.query("select public.issue_booking_token(gen_random_uuid())"),
      ),
    ).rejects.toThrow(/permission denied/);
  });
});
