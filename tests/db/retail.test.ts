import { beforeAll, describe, expect, it } from "vitest";

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
let staff: string;
let businessId: string;
let productId: string;

const user = (userId: string) => ({ role: "authenticated" as const, userId });
const stock = async () =>
  (
    await db.query<{ stock_quantity: number }>(
      "select stock_quantity from public.products where id = $1",
      [productId],
    )
  ).rows[0]!.stock_quantity;

function order(quantity: number, email = "shopper@example.test") {
  return as(
    db,
    { role: "service_role" },
    (tx) =>
      tx.query<{ result: { order_id: string; total_cents: number } }>(
        "select public.create_online_order($1, $2, 'Eva', 'Shopper', $3, '+32 470 11 22 33') as result",
        [businessId, JSON.stringify([{ product_id: productId, quantity }]), email],
      ),
    { commit: true },
  );
}

beforeAll(async () => {
  db = await createTestDatabase();
  owner = await createUser(db, "Owner");
  staff = await createUser(db, "Staff");
  businessId = await createBusiness(db, owner, "studio-retail", "Studio Retail");
  await addMember(db, businessId, staff, "staff");
  await db.query("update public.businesses set shop_enabled = true where id = $1", [businessId]);
  const { rows } = await as(
    db,
    user(owner),
    (tx) =>
      tx.query<{ id: string }>(
        "insert into public.products (business_id, name, price_cents, is_online) values ($1, 'Repair mask', 2450, true) returning id",
        [businessId],
      ),
    { commit: true },
  );
  productId = rows[0]!.id;
  await as(
    db,
    user(owner),
    (tx) =>
      tx.query(
        "insert into public.inventory_movements (business_id, product_id, quantity_change, reason, created_by) values ($1, $2, 5, 'initial', $3)",
        [businessId, productId, owner],
      ),
    { commit: true },
  );
});

describe("inventory", () => {
  it("applies stock movements to the product", async () => {
    expect(await stock()).toBe(5);
  });

  it("never lets stock go below zero", async () => {
    await expect(
      as(db, user(owner), (tx) =>
        tx.query(
          "insert into public.inventory_movements (business_id, product_id, quantity_change, reason, created_by) values ($1, $2, -6, 'adjustment', $3)",
          [businessId, productId, owner],
        ),
      ),
    ).rejects.toThrow(/stock_quantity_check/);
    expect(await stock()).toBe(5);
  });

  it("does not allow editing stock directly", async () => {
    await expect(
      as(db, user(owner), (tx) => tx.query("update public.products set stock_quantity = 999")),
    ).rejects.toThrow(/permission denied/);
  });

  it("keeps stock management away from staff by default", async () => {
    await expect(
      as(db, user(staff), (tx) =>
        tx.query(
          "insert into public.inventory_movements (business_id, product_id, quantity_change, reason, created_by) values ($1, $2, 1, 'restock', $3)",
          [businessId, productId, staff],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });
});

describe("click-and-collect orders", () => {
  it("creates an unpaid order with server-side totals and reserves stock", async () => {
    const { rows } = await order(2);
    expect(rows[0]!.result.total_cents).toBe(4900);
    expect(await stock()).toBe(3);
    const { rows: saved } = await db.query<{ payment_status: string; status: string }>(
      "select payment_status, status from public.orders where id = $1",
      [rows[0]!.result.order_id],
    );
    expect(saved[0]).toEqual({ payment_status: "unpaid", status: "pending" });
  });

  it("refuses orders larger than the available stock", async () => {
    await expect(order(4, "second@example.test")).rejects.toThrow(/out_of_stock/);
    expect(await stock()).toBe(3);
  });

  it("returns stock when an order is cancelled", async () => {
    const { rows } = await order(1, "third@example.test");
    expect(await stock()).toBe(2);
    await as(
      db,
      user(owner),
      (tx) => tx.query("select public.cancel_order($1)", [rows[0]!.result.order_id]),
      { commit: true },
    );
    expect(await stock()).toBe(3);
    await expect(
      as(db, user(owner), (tx) =>
        tx.query("select public.cancel_order($1)", [rows[0]!.result.order_id]),
      ),
    ).rejects.toThrow(/already cancelled/);
  });

  it("is only callable by the NORYX server and hidden from staff", async () => {
    await expect(
      as(db, { role: "anon" }, (tx) =>
        tx.query("select public.create_online_order($1, '[]', 'a', 'b', 'a@b.co', '1')", [
          businessId,
        ]),
      ),
    ).rejects.toThrow(/permission denied/);
    const staffView = await as(db, user(staff), (tx) => tx.query("select id from public.orders"));
    expect(staffView.rows).toHaveLength(0);
  });

  it("exposes only public product fields to visitors", async () => {
    const { rows } = await as(db, { role: "anon" }, (tx) =>
      tx.query<{ products: Record<string, unknown>[] }>(
        "select public.get_public_products('studio-retail') as products",
      ),
    );
    expect(rows[0]!.products[0]).toMatchObject({ name: "Repair mask", in_stock: true });
    expect(rows[0]!.products[0]).not.toHaveProperty("cost_cents");
    expect(rows[0]!.products[0]).not.toHaveProperty("stock_quantity");
  });
});
