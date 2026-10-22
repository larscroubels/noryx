-- Gift cards: sold by the salon, redeemed against appointments and shop orders.
--
-- NORYX has no payment provider. A client can order a card online, but it stays
-- 'pending' (no code, no value) until the salon records that it was paid at the
-- desk. Only then does activate_gift_card() generate the code and credit the value.
--
-- Money follows an append-only ledger: gift_card_transactions holds every credit
-- and debit with the balance after it; gift_cards.balance_cents is a cached copy
-- that only these functions change, always under a row lock. Mistakes are fixed
-- with a reversal or an adjustment, never by editing history.
--
-- Codes are 16 characters from a 32-letter alphabet (80 random bits). Only their
-- SHA-256 hash and last four characters are stored; the full code is returned
-- once, when the card is activated.
--
-- Accounting (confirmed by the product owner): selling a card is not revenue.
-- Redeeming it is, so on businesses with the finance feature each redemption also
-- records a payment with method 'voucher'.
--
-- Rollback: drop the functions below, then gift_card_transactions, gift_cards,
-- their enum types, the businesses.gift_card_* columns and the gift_cards.manage
-- permission (role_permissions rows cascade).

-- ── Permission ──────────────────────────────────────────────────────────────
insert into public.permissions (key, description) values
  ('gift_cards.manage', 'Sell, activate and manage gift cards');
insert into public.role_permissions (role, permission) values ('manager', 'gift_cards.manage');

-- ── Salon settings ──────────────────────────────────────────────────────────
alter table public.businesses
  add column gift_cards_enabled boolean not null default false,
  add column gift_card_amounts integer[] not null default '{2500,5000,10000}'
    check (cardinality(gift_card_amounts) <= 8 and 500 <= all (gift_card_amounts) and 100000 >= all (gift_card_amounts)),
  add column gift_card_allow_custom boolean not null default false,
  add column gift_card_min_cents integer not null default 1000 check (gift_card_min_cents between 500 and 100000),
  add column gift_card_max_cents integer not null default 50000 check (gift_card_max_cents between 500 and 100000),
  -- NULL: cards do not expire. The salon decides; NORYX imposes no term.
  add column gift_card_validity_months integer check (gift_card_validity_months between 1 and 120),
  add column gift_card_terms text check (gift_card_terms is null or char_length(gift_card_terms) <= 1000),
  add constraint businesses_gift_card_range check (gift_card_min_cents <= gift_card_max_cents);

grant update (
  gift_cards_enabled, gift_card_amounts, gift_card_allow_custom, gift_card_min_cents,
  gift_card_max_cents, gift_card_validity_months, gift_card_terms
) on public.businesses to authenticated;

-- ── Tables ──────────────────────────────────────────────────────────────────
create type public.gift_card_status as enum ('pending', 'active', 'blocked', 'cancelled');
create type public.gift_card_transaction_kind as enum ('issue', 'redeem', 'reversal', 'adjustment', 'cancellation');

create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  number bigint generated always as identity,
  status public.gift_card_status not null default 'pending',
  source text not null check (source in ('online', 'desk')),
  initial_cents integer not null check (initial_cents between 100 and 1000000),
  balance_cents integer not null default 0 check (balance_cents between 0 and 1000000),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  code_hash text unique,
  code_last4 text check (code_last4 is null or code_last4 ~ '^[0-9A-Z]{4}$'),
  buyer_name text not null check (char_length(btrim(buyer_name)) between 1 and 160),
  buyer_email text check (buyer_email is null or buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  buyer_phone text check (buyer_phone is null or char_length(buyer_phone) <= 32),
  recipient_name text check (recipient_name is null or char_length(recipient_name) <= 160),
  message text check (message is null or char_length(message) <= 300),
  sale_method public.payment_method,
  paid_at timestamptz,
  activated_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz,
  status_reason text check (status_reason is null or char_length(status_reason) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id),
  -- A card holds a code and a payment exactly when it has been activated.
  check ((status = 'pending') = (code_hash is null)),
  check ((code_hash is null) = (paid_at is null))
);

create index gift_cards_business_created_idx on public.gift_cards (business_id, created_at desc);
create index gift_cards_business_number_idx on public.gift_cards (business_id, number);

create trigger gift_cards_set_updated_at
before update on public.gift_cards
for each row execute function public.set_updated_at();

create table public.gift_card_transactions (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  gift_card_id uuid not null,
  kind public.gift_card_transaction_kind not null,
  -- Positive credits the card, negative debits it.
  amount_cents integer not null check (amount_cents <> 0),
  balance_after_cents integer not null check (balance_after_cents >= 0),
  appointment_id uuid,
  order_id uuid,
  payment_id uuid references public.payments (id) on delete set null,
  reverses_id bigint unique references public.gift_card_transactions (id),
  reason text check (reason is null or char_length(reason) <= 300),
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (business_id, gift_card_id) references public.gift_cards (business_id, id) on delete cascade,
  foreign key (business_id, appointment_id)
    references public.appointments (business_id, id) on delete set null (appointment_id),
  foreign key (business_id, order_id)
    references public.orders (business_id, id) on delete set null (order_id)
);

create index gift_card_transactions_card_idx on public.gift_card_transactions (gift_card_id, id);
create index gift_card_transactions_appointment_idx on public.gift_card_transactions (appointment_id) where appointment_id is not null;
create index gift_card_transactions_order_idx on public.gift_card_transactions (order_id) where order_id is not null;

alter table public.gift_cards enable row level security;
alter table public.gift_card_transactions enable row level security;

create policy "gift_cards: managers and finance read" on public.gift_cards for select to authenticated
using (
  public.has_business_permission(business_id, 'gift_cards.manage')
  or public.has_business_permission(business_id, 'finance.view')
);
create policy "gift_card_transactions: managers and finance read" on public.gift_card_transactions for select to authenticated
using (
  public.has_business_permission(business_id, 'gift_cards.manage')
  or public.has_business_permission(business_id, 'finance.view')
);

-- Every change goes through the functions below.
revoke all on table public.gift_cards, public.gift_card_transactions from anon, authenticated;
grant select on public.gift_cards, public.gift_card_transactions to authenticated;

-- ── Internal helpers ────────────────────────────────────────────────────────
create function public.gift_card_hash(p_code text)
returns text
language sql
immutable
set search_path = ''
as $$
  -- Normalised like Crockford base 32: case, spaces and dashes don't matter, O reads as 0, I and L as 1.
  select encode(extensions.digest(
    translate(upper(regexp_replace(coalesce(p_code, ''), '[^0-9A-Za-z]', '', 'g')), 'OIL', '011'),
    'sha256'), 'hex');
$$;

-- 16 Crockford base-32 characters (no I, L, O or U): 16 x 5 = 80 random bits.
create function public.gift_card_new_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  v_bytes bytea := extensions.gen_random_bytes(16);
  v_code text := '';
begin
  for i in 0..15 loop
    -- 256 is a multiple of 32, so every symbol is equally likely.
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
  end loop;
  return substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4) || '-' || substr(v_code, 13, 4);
end;
$$;

create function public.gift_card_amount_allowed(p_business_id uuid, p_amount integer)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_amount = any (b.gift_card_amounts)
      or (b.gift_card_allow_custom and p_amount between b.gift_card_min_cents and b.gift_card_max_cents)
  from public.businesses b
  where b.id = p_business_id;
$$;

-- Activates a locked, pending card: code, value, expiry and the opening ledger entry.
create function public.gift_card_activate_locked(p_card public.gift_cards, p_method public.payment_method)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_months integer;
begin
  select gift_card_validity_months into v_months from public.businesses where id = p_card.business_id;
  loop
    v_code := public.gift_card_new_code();
    exit when not exists (select 1 from public.gift_cards where code_hash = public.gift_card_hash(v_code));
  end loop;

  update public.gift_cards
  set status = 'active',
      code_hash = public.gift_card_hash(v_code),
      code_last4 = right(v_code, 4),
      balance_cents = initial_cents,
      sale_method = p_method,
      paid_at = now(),
      activated_by = (select auth.uid()),
      expires_at = case when v_months is null then null else now() + make_interval(months => v_months) end
  where id = p_card.id;

  insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents, actor_user_id)
  values (p_card.business_id, p_card.id, 'issue', p_card.initial_cents, p_card.initial_cents, (select auth.uid()));

  perform public.log_audit_event(p_card.business_id, 'gift_card.activated', 'gift_card', p_card.id::text,
    jsonb_build_object('number', p_card.number, 'amount_cents', p_card.initial_cents, 'method', p_method));
  return v_code;
end;
$$;

create function public.gift_card_require_reason(p_reason text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_reason is null or char_length(btrim(p_reason)) < 3 then
    raise exception 'gift_card_reason_required' using errcode = 'P0001';
  end if;
  return left(btrim(p_reason), 300);
end;
$$;

-- ── Selling ─────────────────────────────────────────────────────────────────
-- Online order from the salon's public page. NORYX server only (rate-limited there).
create function public.create_online_gift_card(
  p_business_id uuid,
  p_amount_cents integer,
  p_buyer_name text,
  p_buyer_email text,
  p_buyer_phone text default null,
  p_recipient_name text default null,
  p_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.businesses%rowtype;
  v_card public.gift_cards%rowtype;
begin
  select * into b from public.businesses where id = p_business_id;
  if not found or b.status <> 'active' or not b.gift_cards_enabled then
    raise exception 'gift_cards_unavailable' using errcode = 'P0001';
  end if;
  if not public.gift_card_amount_allowed(p_business_id, p_amount_cents) then
    raise exception 'gift_card_amount_invalid' using errcode = 'P0001';
  end if;

  insert into public.gift_cards (business_id, source, initial_cents, currency, buyer_name, buyer_email, buyer_phone, recipient_name, message)
  values (p_business_id, 'online', p_amount_cents, b.currency, btrim(p_buyer_name), nullif(btrim(p_buyer_email), ''),
    nullif(btrim(p_buyer_phone), ''), nullif(btrim(p_recipient_name), ''), nullif(btrim(p_message), ''))
  returning * into v_card;

  insert into public.notifications (business_id, channel, template, recipient, payload)
  values (p_business_id, 'email', 'gift_card_ordered', coalesce(b.email, ''),
    jsonb_build_object('audience', 'business', 'gift_card_id', v_card.id, 'number', v_card.number));

  return jsonb_build_object('gift_card_id', v_card.id, 'number', v_card.number,
    'amount_cents', v_card.initial_cents, 'currency', v_card.currency);
end;
$$;

-- Sold and paid at the desk: created and activated in one step.
create function public.create_desk_gift_card(
  p_business_id uuid,
  p_amount_cents integer,
  p_method public.payment_method,
  p_buyer_name text,
  p_buyer_email text default null,
  p_recipient_name text default null,
  p_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.gift_cards%rowtype;
begin
  if not public.can_manage(p_business_id, 'gift_cards.manage') then
    raise exception 'You do not have permission to sell gift cards' using errcode = '42501';
  end if;
  if p_method = 'voucher' then
    raise exception 'gift_card_method_invalid' using errcode = 'P0001';
  end if;

  insert into public.gift_cards (business_id, source, initial_cents, currency, buyer_name, buyer_email, recipient_name, message)
  select p_business_id, 'desk', p_amount_cents, b.currency, btrim(p_buyer_name), nullif(btrim(p_buyer_email), ''),
    nullif(btrim(p_recipient_name), ''), nullif(btrim(p_message), '')
  from public.businesses b where b.id = p_business_id
  returning * into v_card;

  return jsonb_build_object('gift_card_id', v_card.id, 'number', v_card.number,
    'code', public.gift_card_activate_locked(v_card, p_method));
end;
$$;

-- The salon confirms payment of an online order. Activating twice is refused, so a
-- repeated confirmation can never create a second code or credit the value twice.
create function public.activate_gift_card(p_gift_card_id uuid, p_method public.payment_method)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.gift_cards%rowtype;
begin
  select * into v_card from public.gift_cards where id = p_gift_card_id for update;
  if not found or not public.can_manage(v_card.business_id, 'gift_cards.manage') then
    raise exception 'You do not have permission to activate this gift card' using errcode = '42501';
  end if;
  if v_card.status <> 'pending' then
    raise exception 'gift_card_not_pending' using errcode = 'P0001';
  end if;
  if p_method = 'voucher' then
    raise exception 'gift_card_method_invalid' using errcode = 'P0001';
  end if;
  return jsonb_build_object('gift_card_id', v_card.id, 'number', v_card.number,
    'code', public.gift_card_activate_locked(v_card, p_method));
end;
$$;

-- ── Redeeming ───────────────────────────────────────────────────────────────
-- Debits a card for an appointment or order. The row lock serialises concurrent
-- redemptions, so together they can never spend more than the balance.
create function public.redeem_gift_card(
  p_business_id uuid,
  p_code text,
  p_amount_cents integer,
  p_appointment_id uuid default null,
  p_order_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.gift_cards%rowtype;
  v_customer uuid;
  v_payment uuid;
  v_tx bigint;
begin
  if not (
    public.can_manage(p_business_id, 'gift_cards.manage')
    or public.can_manage(p_business_id, 'appointments.manage_all')
    or public.can_manage(p_business_id, 'finance.manage')
    or (p_order_id is not null and public.can_manage(p_business_id, 'orders.manage'))
  ) then
    raise exception 'You do not have permission to redeem gift cards' using errcode = '42501';
  end if;
  if p_amount_cents is null or p_amount_cents < 1 then
    raise exception 'gift_card_amount_invalid' using errcode = 'P0001';
  end if;
  if (p_appointment_id is null) = (p_order_id is null) then
    raise exception 'gift_card_purchase_required' using errcode = 'P0001';
  end if;
  if p_appointment_id is not null then
    select customer_id into v_customer from public.appointments
    where id = p_appointment_id and business_id = p_business_id;
    if not found then raise exception 'gift_card_purchase_required' using errcode = 'P0001'; end if;
  else
    select customer_id into v_customer from public.orders
    where id = p_order_id and business_id = p_business_id;
    if not found then raise exception 'gift_card_purchase_required' using errcode = 'P0001'; end if;
  end if;

  select * into v_card from public.gift_cards
  where business_id = p_business_id and code_hash = public.gift_card_hash(p_code)
  for update;
  if not found or v_card.status = 'cancelled' then
    raise exception 'gift_card_invalid' using errcode = 'P0001';
  end if;
  if v_card.status = 'blocked' then
    raise exception 'gift_card_blocked' using errcode = 'P0001';
  end if;
  if v_card.expires_at is not null and v_card.expires_at <= now() then
    raise exception 'gift_card_expired' using errcode = 'P0001';
  end if;
  if v_card.balance_cents = 0 then
    raise exception 'gift_card_empty' using errcode = 'P0001';
  end if;
  if p_amount_cents > v_card.balance_cents then
    raise exception 'gift_card_insufficient' using errcode = 'P0001', detail = v_card.balance_cents::text;
  end if;

  update public.gift_cards set balance_cents = balance_cents - p_amount_cents where id = v_card.id;

  -- Revenue is recognised on redemption, in the finance module when the plan has it.
  if public.business_has_feature(p_business_id, 'finance') then
    insert into public.payments (business_id, appointment_id, customer_id, amount_cents, currency, method, note, recorded_by)
    values (p_business_id, p_appointment_id, v_customer, p_amount_cents, v_card.currency, 'voucher',
      'Gift card #' || v_card.number, (select auth.uid()))
    returning id into v_payment;
  end if;

  insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents,
    appointment_id, order_id, payment_id, actor_user_id)
  values (p_business_id, v_card.id, 'redeem', -p_amount_cents, v_card.balance_cents - p_amount_cents,
    p_appointment_id, p_order_id, v_payment, (select auth.uid()))
  returning id into v_tx;

  return jsonb_build_object('transaction_id', v_tx, 'number', v_card.number,
    'balance_cents', v_card.balance_cents - p_amount_cents, 'currency', v_card.currency, 'payment_id', v_payment);
end;
$$;

-- ── Administration (gift_cards.manage, reason required, audited) ────────────
create function public.reverse_gift_card_redemption(p_transaction_id bigint, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx public.gift_card_transactions%rowtype;
  v_card public.gift_cards%rowtype;
  v_reason text;
begin
  select * into v_tx from public.gift_card_transactions where id = p_transaction_id;
  if not found or not public.can_manage(v_tx.business_id, 'gift_cards.manage') then
    raise exception 'You do not have permission to change this gift card' using errcode = '42501';
  end if;
  v_reason := public.gift_card_require_reason(p_reason);
  if v_tx.kind <> 'redeem' then
    raise exception 'gift_card_not_reversible' using errcode = 'P0001';
  end if;
  select * into v_card from public.gift_cards where id = v_tx.gift_card_id for update;
  if v_card.status = 'cancelled' then
    raise exception 'gift_card_invalid' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.gift_card_transactions where reverses_id = v_tx.id) then
    raise exception 'gift_card_already_reversed' using errcode = 'P0001';
  end if;

  update public.gift_cards set balance_cents = balance_cents - v_tx.amount_cents where id = v_card.id;
  insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents,
    appointment_id, order_id, reverses_id, reason, actor_user_id)
  values (v_card.business_id, v_card.id, 'reversal', -v_tx.amount_cents, v_card.balance_cents - v_tx.amount_cents,
    v_tx.appointment_id, v_tx.order_id, v_tx.id, v_reason, (select auth.uid()));

  update public.payments set status = 'refunded', refunded_at = now(), refunded_by = (select auth.uid())
  where id = v_tx.payment_id and status = 'recorded';

  perform public.log_audit_event(v_card.business_id, 'gift_card.redemption_reversed', 'gift_card', v_card.id::text,
    jsonb_build_object('number', v_card.number, 'amount_cents', -v_tx.amount_cents, 'reason', v_reason));
end;
$$;

create function public.set_gift_card_blocked(p_gift_card_id uuid, p_blocked boolean, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.gift_cards%rowtype;
  v_reason text;
begin
  select * into v_card from public.gift_cards where id = p_gift_card_id for update;
  if not found or not public.can_manage(v_card.business_id, 'gift_cards.manage') then
    raise exception 'You do not have permission to change this gift card' using errcode = '42501';
  end if;
  v_reason := public.gift_card_require_reason(p_reason);
  if v_card.status <> (case when p_blocked then 'active' else 'blocked' end)::public.gift_card_status then
    raise exception 'gift_card_status_unchanged' using errcode = 'P0001';
  end if;
  update public.gift_cards
  set status = case when p_blocked then 'blocked' else 'active' end::public.gift_card_status,
      status_reason = v_reason
  where id = v_card.id;
  perform public.log_audit_event(v_card.business_id,
    case when p_blocked then 'gift_card.blocked' else 'gift_card.unblocked' end,
    'gift_card', v_card.id::text, jsonb_build_object('number', v_card.number, 'reason', v_reason));
end;
$$;

-- Cancels a card. Remaining value is written off in the ledger; any refund to the
-- buyer happens outside NORYX, following the salon's own policy.
create function public.cancel_gift_card(p_gift_card_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.gift_cards%rowtype;
  v_reason text;
begin
  select * into v_card from public.gift_cards where id = p_gift_card_id for update;
  if not found or not public.can_manage(v_card.business_id, 'gift_cards.manage') then
    raise exception 'You do not have permission to change this gift card' using errcode = '42501';
  end if;
  v_reason := public.gift_card_require_reason(p_reason);
  if v_card.status = 'cancelled' then
    raise exception 'gift_card_status_unchanged' using errcode = 'P0001';
  end if;
  if v_card.balance_cents > 0 then
    insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents, reason, actor_user_id)
    values (v_card.business_id, v_card.id, 'cancellation', -v_card.balance_cents, 0, v_reason, (select auth.uid()));
  end if;
  update public.gift_cards set status = 'cancelled', balance_cents = 0, status_reason = v_reason where id = v_card.id;
  perform public.log_audit_event(v_card.business_id, 'gift_card.cancelled', 'gift_card', v_card.id::text,
    jsonb_build_object('number', v_card.number, 'written_off_cents', v_card.balance_cents, 'reason', v_reason));
end;
$$;

-- A traceable correction (positive or negative) instead of editing history.
create function public.adjust_gift_card(p_gift_card_id uuid, p_amount_cents integer, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.gift_cards%rowtype;
  v_reason text;
begin
  select * into v_card from public.gift_cards where id = p_gift_card_id for update;
  if not found or not public.can_manage(v_card.business_id, 'gift_cards.manage') then
    raise exception 'You do not have permission to change this gift card' using errcode = '42501';
  end if;
  v_reason := public.gift_card_require_reason(p_reason);
  if v_card.status not in ('active', 'blocked') then
    raise exception 'gift_card_invalid' using errcode = 'P0001';
  end if;
  if p_amount_cents is null or p_amount_cents = 0
     or v_card.balance_cents + p_amount_cents not between 0 and 1000000 then
    raise exception 'gift_card_amount_invalid' using errcode = 'P0001';
  end if;
  update public.gift_cards set balance_cents = balance_cents + p_amount_cents where id = v_card.id;
  insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents, reason, actor_user_id)
  values (v_card.business_id, v_card.id, 'adjustment', p_amount_cents, v_card.balance_cents + p_amount_cents, v_reason, (select auth.uid()));
  perform public.log_audit_event(v_card.business_id, 'gift_card.adjusted', 'gift_card', v_card.id::text,
    jsonb_build_object('number', v_card.number, 'amount_cents', p_amount_cents, 'reason', v_reason));
end;
$$;

-- ── Public ──────────────────────────────────────────────────────────────────
-- What the salon offers, for the order page. NULL when gift cards are switched off.
create function public.get_public_gift_card_offer(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business_id', b.id,
    'name', b.name,
    'currency', b.currency,
    'locale', b.locale,
    'amounts', to_jsonb(b.gift_card_amounts),
    'allow_custom', b.gift_card_allow_custom,
    'min_cents', b.gift_card_min_cents,
    'max_cents', b.gift_card_max_cents,
    'validity_months', b.gift_card_validity_months,
    'terms', b.gift_card_terms,
    'phone', b.phone
  )
  from public.businesses b
  where b.slug = lower(p_slug) and b.status = 'active' and b.gift_cards_enabled;
$$;

-- What the holder of a code may see. Scoped to the salon's slug; an unknown code
-- and a code from another salon look exactly the same (NULL).
create function public.get_gift_card_by_code(p_slug text, p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business_name', b.name,
    'currency', g.currency,
    'locale', b.locale,
    'number', g.number,
    'last4', g.code_last4,
    'status', case
      when g.status = 'active' and g.expires_at is not null and g.expires_at <= now() then 'expired'
      when g.status = 'active' and g.balance_cents = 0 then 'used'
      else g.status::text
    end,
    'initial_cents', g.initial_cents,
    'balance_cents', g.balance_cents,
    'expires_at', g.expires_at,
    'recipient_name', g.recipient_name,
    'message', g.message,
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('kind', t.kind, 'amount_cents', t.amount_cents, 'created_at', t.created_at) order by t.id)
      from public.gift_card_transactions t where t.gift_card_id = g.id
    ), '[]'::jsonb)
  )
  from public.gift_cards g
  join public.businesses b on b.id = g.business_id
  where b.slug = lower(p_slug) and g.code_hash = public.gift_card_hash(p_code);
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────
revoke execute on function public.gift_card_hash(text) from public, anon, authenticated;
revoke execute on function public.gift_card_new_code() from public, anon, authenticated;
revoke execute on function public.gift_card_amount_allowed(uuid, integer) from public, anon, authenticated;
revoke execute on function public.gift_card_activate_locked(public.gift_cards, public.payment_method) from public, anon, authenticated;
revoke execute on function public.gift_card_require_reason(text) from public, anon, authenticated;
revoke execute on function public.create_online_gift_card(uuid, integer, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.create_desk_gift_card(uuid, integer, public.payment_method, text, text, text, text) from public, anon;
revoke execute on function public.activate_gift_card(uuid, public.payment_method) from public, anon;
revoke execute on function public.redeem_gift_card(uuid, text, integer, uuid, uuid) from public, anon;
revoke execute on function public.reverse_gift_card_redemption(bigint, text) from public, anon;
revoke execute on function public.set_gift_card_blocked(uuid, boolean, text) from public, anon;
revoke execute on function public.cancel_gift_card(uuid, text) from public, anon;
revoke execute on function public.adjust_gift_card(uuid, integer, text) from public, anon;
revoke execute on function public.get_public_gift_card_offer(text) from public;
revoke execute on function public.get_gift_card_by_code(text, text) from public, anon, authenticated;

grant execute on function public.create_online_gift_card(uuid, integer, text, text, text, text, text) to service_role;
grant execute on function public.create_desk_gift_card(uuid, integer, public.payment_method, text, text, text, text) to authenticated;
grant execute on function public.activate_gift_card(uuid, public.payment_method) to authenticated;
grant execute on function public.redeem_gift_card(uuid, text, integer, uuid, uuid) to authenticated;
grant execute on function public.reverse_gift_card_redemption(bigint, text) to authenticated;
grant execute on function public.set_gift_card_blocked(uuid, boolean, text) to authenticated;
grant execute on function public.cancel_gift_card(uuid, text) to authenticated;
grant execute on function public.adjust_gift_card(uuid, integer, text) to authenticated;
grant execute on function public.get_public_gift_card_offer(text) to anon, authenticated;
-- Code lookups are rate-limited in the NORYX server before they reach this function.
grant execute on function public.get_gift_card_by_code(text, text) to service_role;
