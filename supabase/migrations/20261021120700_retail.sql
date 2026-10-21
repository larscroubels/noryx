-- Retail: products, inventory movements, click-and-collect orders.
--
-- Integrity rules:
--   * Stock is changed only by inserting inventory movements; a trigger applies
--     them and a CHECK constraint makes negative stock impossible.
--   * Online orders are created atomically by create_online_order (service role
--     only): product rows are locked, stock is reserved, totals are computed in
--     the database from current prices — never trusted from the browser.
--   * Orders start unpaid. NORYX does not take online payments yet; the salon
--     marks an order paid when the client pays at pickup.

alter table public.businesses add column shop_enabled boolean not null default false;
grant update (shop_enabled) on public.businesses to authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  sku text check (sku is null or char_length(sku) <= 64),
  category text check (category is null or char_length(category) <= 80),
  price_cents integer not null check (price_cents between 0 and 10000000),
  cost_cents integer check (cost_cents is null or cost_cents between 0 and 10000000),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold between 0 and 100000),
  is_active boolean not null default true,
  is_online boolean not null default false,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create unique index products_sku_key on public.products (business_id, lower(sku)) where sku is not null;
create index products_business_idx on public.products (business_id, name);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create type public.inventory_reason as enum (
  'initial', 'restock', 'adjustment', 'damage', 'return', 'sale', 'order', 'order_cancelled'
);

create type public.order_status as enum ('pending', 'confirmed', 'ready', 'completed', 'cancelled');
create type public.order_payment_status as enum ('unpaid', 'paid', 'refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  order_number bigint generated always as identity,
  customer_id uuid,
  customer_name text not null check (char_length(customer_name) between 1 and 160),
  customer_email text check (customer_email is null or customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  customer_phone text check (customer_phone is null or char_length(customer_phone) <= 32),
  status public.order_status not null default 'pending',
  payment_status public.order_payment_status not null default 'unpaid',
  fulfilment text not null default 'pickup' check (fulfilment in ('pickup')),
  total_cents integer not null check (total_cents >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  note text check (note is null or char_length(note) <= 500),
  source text not null default 'online' check (source in ('online', 'staff')),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id),
  foreign key (business_id, customer_id) references public.customers (business_id, id) on delete set null (customer_id)
);

create index orders_business_created_idx on public.orders (business_id, created_at desc);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  order_id uuid not null,
  product_id uuid,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 100),
  line_total_cents integer not null check (line_total_cents = unit_price_cents * quantity),
  foreign key (business_id, order_id) references public.orders (business_id, id) on delete cascade,
  foreign key (business_id, product_id) references public.products (business_id, id) on delete set null (product_id)
);

create index order_items_order_idx on public.order_items (order_id);

create table public.inventory_movements (
  id bigint generated always as identity primary key,
  business_id uuid not null,
  product_id uuid not null,
  quantity_change integer not null check (quantity_change <> 0 and quantity_change between -100000 and 100000),
  reason public.inventory_reason not null,
  note text check (note is null or char_length(note) <= 200),
  order_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (business_id, product_id) references public.products (business_id, id) on delete cascade,
  foreign key (business_id, order_id) references public.orders (business_id, id) on delete set null (order_id)
);

create index inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);

-- Applies a movement to the product's stock. The CHECK on products.stock_quantity
-- rejects the whole insert if stock would go below zero.
create function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.products
  set stock_quantity = stock_quantity + new.quantity_change
  where id = new.product_id and business_id = new.business_id;
  return new;
end;
$$;

create trigger inventory_movements_apply
after insert on public.inventory_movements
for each row execute function public.apply_inventory_movement();

-- Order status rules: cancelled and completed are final.
create function public.validate_order_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if old.status in ('cancelled', 'completed') then
      raise exception 'This order is already %', old.status using errcode = '22023';
    end if;
    if new.status = 'cancelled' then
      new.cancelled_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger orders_validate_status
before update on public.orders
for each row execute function public.validate_order_status();

-- RLS
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "products: members read" on public.products for select to authenticated
using (public.is_business_member(business_id));
create policy "products: product managers write" on public.products for all to authenticated
using (public.can_manage(business_id, 'products.manage'))
with check (public.can_manage(business_id, 'products.manage'));

create policy "inventory_movements: stock managers read" on public.inventory_movements for select to authenticated
using (
  public.has_business_permission(business_id, 'inventory.manage')
  or public.has_business_permission(business_id, 'products.manage')
);
create policy "inventory_movements: stock managers insert" on public.inventory_movements for insert to authenticated
with check (
  public.can_manage(business_id, 'inventory.manage')
  and created_by = (select auth.uid())
  and reason in ('initial', 'restock', 'adjustment', 'damage', 'return', 'sale')
);

create policy "orders: order managers read" on public.orders for select to authenticated
using (public.has_business_permission(business_id, 'orders.manage'));
create policy "orders: order managers update" on public.orders for update to authenticated
using (public.can_manage(business_id, 'orders.manage'))
with check (public.can_manage(business_id, 'orders.manage'));

create policy "order_items: order managers read" on public.order_items for select to authenticated
using (public.has_business_permission(business_id, 'orders.manage'));

revoke all on table public.products, public.inventory_movements, public.orders, public.order_items from anon, authenticated;
grant select, insert, delete on public.products to authenticated;
-- stock_quantity is deliberately not updatable: use inventory movements.
grant update (
  name, description, sku, category, price_cents, cost_cents, low_stock_threshold, is_active, is_online, image_path
) on public.products to authenticated;
grant select, insert on public.inventory_movements to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant update (status, payment_status) on public.orders to authenticated;

-- Cancelling returns reserved stock in the same transaction.
create function public.cancel_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found or not public.can_manage(o.business_id, 'orders.manage') then
    raise exception 'You do not have permission to cancel this order' using errcode = '42501';
  end if;
  if o.status in ('cancelled', 'completed') then
    raise exception 'This order is already %', o.status using errcode = '22023';
  end if;
  update public.orders set status = 'cancelled' where id = o.id;
  insert into public.inventory_movements (business_id, product_id, quantity_change, reason, order_id, created_by)
  select o.business_id, i.product_id, i.quantity, 'order_cancelled', o.id, (select auth.uid())
  from public.order_items i where i.order_id = o.id and i.product_id is not null;
end;
$$;

-- Atomic click-and-collect order. Only the NORYX server (service role) may call it.
create function public.create_online_order(
  p_business_id uuid,
  p_items jsonb,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.businesses%rowtype;
  v_email text := lower(btrim(p_email));
  v_customer_id uuid;
  v_order_id uuid;
  v_number bigint;
  v_total integer := 0;
  item record;
begin
  select * into b from public.businesses where id = p_business_id;
  if not found or b.status <> 'active' or not b.shop_enabled then
    raise exception 'shop_unavailable' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;

  -- Lock the products in a stable order to avoid deadlocks between concurrent orders.
  perform 1 from public.products
  where business_id = b.id and id in (select (e ->> 'product_id')::uuid from jsonb_array_elements(p_items) e)
  order by id
  for update;

  for item in
    select p.id, p.name, p.price_cents, p.stock_quantity, sum((e ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) e
    left join public.products p
      on p.id = (e ->> 'product_id')::uuid and p.business_id = b.id and p.is_active and p.is_online
    group by p.id, p.name, p.price_cents, p.stock_quantity
  loop
    if item.id is null then
      raise exception 'product_unavailable' using errcode = 'P0001';
    end if;
    if item.quantity < 1 or item.quantity > 100 then
      raise exception 'invalid_items' using errcode = 'P0001';
    end if;
    if item.stock_quantity < item.quantity then
      raise exception 'out_of_stock' using errcode = 'P0001', detail = item.name;
    end if;
    v_total := v_total + item.price_cents * item.quantity;
  end loop;

  insert into public.customers (business_id, first_name, last_name, email, phone, source)
  values (b.id, btrim(p_first_name), nullif(btrim(p_last_name), ''), v_email, nullif(btrim(p_phone), ''), 'online_booking')
  on conflict (business_id, lower(email)) where email is not null
  do update set phone = coalesce(public.customers.phone, excluded.phone)
  returning id into v_customer_id;

  insert into public.orders (business_id, customer_id, customer_name, customer_email, customer_phone, total_cents, currency, note)
  values (b.id, v_customer_id, btrim(p_first_name || ' ' || coalesce(p_last_name, '')), v_email, nullif(btrim(p_phone), ''),
          v_total, b.currency, nullif(btrim(p_note), ''))
  returning id, order_number into v_order_id, v_number;

  insert into public.order_items (business_id, order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents)
  select b.id, v_order_id, p.id, p.name, p.price_cents, q.quantity, p.price_cents * q.quantity
  from (
    select (e ->> 'product_id')::uuid as product_id, sum((e ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) e group by 1
  ) q
  join public.products p on p.id = q.product_id;

  insert into public.inventory_movements (business_id, product_id, quantity_change, reason, order_id)
  select b.id, i.product_id, -i.quantity, 'order', v_order_id from public.order_items i where i.order_id = v_order_id;

  insert into public.notifications (business_id, channel, template, recipient, payload)
  values
    (b.id, 'email', 'order_received', v_email, jsonb_build_object('order_id', v_order_id, 'audience', 'customer')),
    (b.id, 'email', 'new_online_order', coalesce(b.email, ''), jsonb_build_object('order_id', v_order_id, 'audience', 'business'));

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_number, 'total_cents', v_total, 'currency', b.currency);
end;
$$;

-- Public catalogue for the shop page (only online, active products; no costs).
create function public.get_public_products(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'name', p.name, 'description', p.description, 'category', p.category,
    'price_cents', p.price_cents, 'in_stock', p.stock_quantity > 0,
    'max_quantity', least(p.stock_quantity, 10)
  ) order by p.category nulls last, p.name), '[]'::jsonb)
  from public.products p
  join public.businesses b on b.id = p.business_id
  where b.slug = lower(p_slug) and b.status = 'active' and b.shop_enabled and p.is_active and p.is_online;
$$;

revoke execute on function public.apply_inventory_movement() from public, anon, authenticated;
revoke execute on function public.cancel_order(uuid) from public, anon;
revoke execute on function public.create_online_order(uuid, jsonb, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.get_public_products(text) from public;
grant execute on function public.cancel_order(uuid) to authenticated;
grant execute on function public.create_online_order(uuid, jsonb, text, text, text, text, text) to service_role;
grant execute on function public.get_public_products(text) to anon, authenticated;
