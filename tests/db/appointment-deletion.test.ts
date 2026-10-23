import { beforeAll, describe, expect, it } from "vitest";

import { zonedTimeToUtc } from "@/lib/time";

import { addMember, as, createBusiness, createTestDatabase, createUser, type TestDatabase } from "./harness";

let db: TestDatabase;
let owner: string;
let anna: string;
let ben: string;
let businessId: string;
let locationId: string;
let serviceId: string;
let annaStaff: string;
let benStaff: string;

const service = { role: "service_role" as const };
const user = (userId: string) => ({ role: "authenticated" as const, userId });

/** A weekday at least two weeks ahead, so it is beyond every cancellation deadline. */
function inTwoWeeks(minute: number) {
  const date = new Date(Date.now() + 14 * 86_400_000);
  while (date.getUTCDay() !== 3) date.setUTCDate(date.getUTCDate() + 1);
  return zonedTimeToUtc(date.toISOString().slice(0, 10), minute, "Europe/Brussels");
}

async function book(staffId: string, minute: number) {
  const { rows } = await as(
    db,
    service,
    (tx) =>
      tx.query<{ result: { appointment_id: string } }>(
        `select public.create_online_booking($1, $2, $3, $4, $5, 'Client', 'Example', 'client@example.test', '+32 470 00 00 00') as result`,
        [businessId, locationId, serviceId, staffId, inTwoWeeks(minute).toISOString()],
      ),
    { commit: true },
  );
  return rows[0]!.result.appointment_id;
}

async function count(table: string, column: string, id: string) {
  const { rows } = await db.query<{ n: number }>(`select count(*)::int as n from public.${table} where ${column} = $1`, [id]);
  return rows[0]!.n;
}

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  anna = await createUser(db, "Anna");
  ben = await createUser(db, "Ben");
  businessId = await createBusiness(db, owner, "studio-delete", "Studio Delete");
  await addMember(db, businessId, anna, "staff");
  await addMember(db, businessId, ben, "staff");
  locationId = (await db.query<{ id: string }>("select id from public.locations where business_id = $1", [businessId]))
    .rows[0]!.id;
  await db.query("update public.businesses set booking_enabled = true where id = $1", [businessId]);
  serviceId = (
    await db.query<{ id: string }>(
      "insert into public.services (business_id, name, duration_minutes, price_cents) values ($1, 'Cut', 60, 4500) returning id",
      [businessId],
    )
  ).rows[0]!.id;
  const { rows } = await db.query<{ id: string; display_name: string }>(
    `insert into public.staff_members (business_id, location_id, user_id, display_name)
     values ($1, $2, $3, 'Anna'), ($1, $2, $4, 'Ben') returning id, display_name`,
    [businessId, locationId, anna, ben],
  );
  annaStaff = rows.find((row) => row.display_name === "Anna")!.id;
  benStaff = rows.find((row) => row.display_name === "Ben")!.id;
  for (const staffId of [annaStaff, benStaff]) {
    await db.query("insert into public.staff_services (business_id, staff_id, service_id) values ($1, $2, $3)", [
      businessId,
      staffId,
      serviceId,
    ]);
    await db.query(
      "insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute) values ($1, $2, 3, 540, 1020)",
      [businessId, staffId],
    );
  }
});

describe("deleting appointments", () => {
  it("lets the salon delete an appointment everywhere, keeping payments unlinked", async () => {
    const id = await book(annaStaff, 600);
    await db.query(
      "insert into public.notifications (business_id, template, recipient, appointment_id) values ($1, 'test_notice', 'x@example.test', $2)",
      [businessId, id],
    );
    const { rows: customer } = await db.query<{ customer_id: string }>(
      "select customer_id from public.appointments where id = $1",
      [id],
    );
    await db.query(
      "insert into public.payments (business_id, appointment_id, customer_id, amount_cents, currency, method) values ($1, $2, $3, 4500, 'EUR', 'card')",
      [businessId, id, customer[0]!.customer_id],
    );

    await as(db, user(owner), (tx) => tx.query("select public.delete_appointment($1)", [id]), { commit: true });

    expect(await count("appointments", "id", id)).toBe(0);
    expect(await count("appointment_events", "appointment_id", id)).toBe(0);
    expect(await count("notifications", "appointment_id", id)).toBe(0);
    const { rows: payments } = await db.query<{ appointment_id: string | null }>(
      "select appointment_id from public.payments where business_id = $1",
      [businessId],
    );
    expect(payments).toEqual([{ appointment_id: null }]);
    const { rows: audit } = await db.query<{ metadata: unknown }>(
      "select metadata from public.audit_events where action = 'appointment.deleted' and entity_id = $1",
      [id],
    );
    expect(audit).toEqual([{ metadata: { by: "business" } }]);
  });

  it("lets staff delete only their own appointments", async () => {
    const own = await book(annaStaff, 720);
    const other = await book(benStaff, 720);
    await expect(
      as(db, user(anna), (tx) => tx.query("select public.delete_appointment($1)", [other])),
    ).rejects.toThrow(/permission/);
    await as(db, user(anna), (tx) => tx.query("select public.delete_appointment($1)", [own]), { commit: true });
    expect(await count("appointments", "id", own)).toBe(0);
    expect(await count("appointments", "id", other)).toBe(1);
  });

  it("lets the client delete a booking through the private link", async () => {
    const id = await book(benStaff, 840);
    const { rows } = await as(
      db,
      service,
      (tx) => tx.query<{ token: string }>("select public.issue_booking_token($1) as token", [id]),
      { commit: true },
    );
    const token = rows[0]!.token;
    await as(db, { role: "anon" }, (tx) => tx.query("select public.delete_booking_by_token($1)", [token]), {
      commit: true,
    });
    expect(await count("appointments", "id", id)).toBe(0);
    const { rows: notice } = await db.query<{ payload: Record<string, string> }>(
      "select payload from public.notifications where template = 'booking_deleted_by_client'",
    );
    expect(notice).toHaveLength(1);
    expect(Object.keys(notice[0]!.payload).sort()).toEqual(
      ["audience", "deleted_appointment_id", "service_name", "starts_at"].sort(),
    );
    await expect(
      as(db, { role: "anon" }, (tx) => tx.query("select public.delete_booking_by_token($1)", [token])),
    ).rejects.toThrow(/booking_not_found/);
  });
});
