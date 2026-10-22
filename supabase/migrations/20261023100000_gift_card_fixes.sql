-- Gift card fixes after review (follows 20261023090000_gift_cards.sql).
--
-- 1. An unpaid online order can be cancelled: the status/code constraints allowed
--    only 'pending' without a code.
-- 2. The "no more than what is still due" cap moves into redeem_gift_card(), under a
--    lock on the appointment or order, so it holds for every redeemer and every caller.
--    Redeeming against a cancelled appointment, or a cancelled or settled order, is refused.
-- 3. A payment recorded by a redemption can only be refunded by reversing that
--    redemption, so revenue and the card ledger can't disagree.
-- 4. Selling at the desk, redeeming and adjusting accept an idempotency key: a retried
--    request returns the first result instead of acting twice.
--
-- Rollback: restore the previous function bodies from 20261023090000_gift_cards.sql,
-- drop gift_card_purchase_due(), the payments trigger and the idempotency columns,
-- and restore the two original CHECK constraints.

-- ── 1. Status and code ──────────────────────────────────────────────────────
alter table public.gift_cards drop constraint gift_cards_check;
alter table public.gift_cards
  add constraint gift_cards_pending_has_no_code check (status <> 'pending' or code_hash is null),
  add constraint gift_cards_usable_has_code check (status not in ('active', 'blocked') or code_hash is not null);

-- ── 4. Idempotency keys ─────────────────────────────────────────────────────
alter table public.gift_cards add column idempotency_key uuid;
alter table public.gift_card_transactions add column idempotency_key uuid;
create unique index gift_cards_idempotency_key on public.gift_cards (business_id, idempotency_key)
  where idempotency_key is not null;
create unique index gift_card_transactions_idempotency_key on public.gift_card_transactions (business_id, idempotency_key)
  where idempotency_key is not null;

-- ── 2. What is still due on a purchase ──────────────────────────────────────
-- Price or total, minus recorded payments that don't come from a gift card, minus
-- what gift cards already paid (net of reversals). Internal; callers lock the row.
create function public.gift_card_due_cents(p_business_id uuid, p_appointment_id uuid, p_order_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    coalesce((
      select a.price_cents from public.appointments a
      where a.id = p_appointment_id and a.business_id = p_business_id
    ), (
      select o.total_cents from public.orders o
      where o.id = p_order_id and o.business_id = p_business_id
    ), 0)
    - coalesce((
      select sum(p.amount_cents) from public.payments p
      where p_appointment_id is not null
        and p.appointment_id = p_appointment_id and p.business_id = p_business_id
        and p.status = 'recorded'
        and not exists (select 1 from public.gift_card_transactions t where t.payment_id = p.id)
    ), 0)
    + coalesce((
      select sum(t.amount_cents) from public.gift_card_transactions t
      where t.business_id = p_business_id
        and t.kind in ('redeem', 'reversal')
        and ((p_appointment_id is not null and t.appointment_id = p_appointment_id)
          or (p_order_id is not null and t.order_id = p_order_id))
    ), 0),
    0
  )::integer;
$$;

-- For the workspace UI, with the same permissions as redeeming.
create function public.gift_card_purchase_due(p_business_id uuid, p_appointment_id uuid default null, p_order_id uuid default null)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select public.gift_card_due_cents(p_business_id, p_appointment_id, p_order_id)
  where public.can_manage(p_business_id, 'gift_cards.manage')
     or public.can_manage(p_business_id, 'appointments.manage_all')
     or public.can_manage(p_business_id, 'finance.manage')
     or (p_order_id is not null and public.can_manage(p_business_id, 'orders.manage'));
$$;

-- ── Redeeming (replaces the first version) ──────────────────────────────────
drop function public.redeem_gift_card(uuid, text, integer, uuid, uuid);

create function public.redeem_gift_card(
  p_business_id uuid,
  p_code text,
  p_amount_cents integer,
  p_appointment_id uuid default null,
  p_order_id uuid default null,
  p_idempotency_key uuid default null
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
  v_due integer;
  v_existing public.gift_card_transactions%rowtype;
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

  -- Lock the purchase first: concurrent redemptions for it queue here.
  if p_appointment_id is not null then
    select customer_id into v_customer from public.appointments
    where id = p_appointment_id and business_id = p_business_id and status <> 'cancelled'
    for update;
  else
    select customer_id into v_customer from public.orders
    where id = p_order_id and business_id = p_business_id
      and status <> 'cancelled' and payment_status = 'unpaid'
    for update;
  end if;
  if not found then
    raise exception 'gift_card_purchase_closed' using errcode = 'P0001';
  end if;

  -- A retried request returns what the first one did.
  if p_idempotency_key is not null then
    select * into v_existing from public.gift_card_transactions
    where business_id = p_business_id and idempotency_key = p_idempotency_key;
    if found then
      select * into v_card from public.gift_cards where id = v_existing.gift_card_id;
      return jsonb_build_object('transaction_id', v_existing.id, 'number', v_card.number,
        'balance_cents', v_existing.balance_after_cents, 'currency', v_card.currency,
        'payment_id', v_existing.payment_id, 'duplicate', true);
    end if;
  end if;

  v_due := public.gift_card_due_cents(p_business_id, p_appointment_id, p_order_id);
  if p_amount_cents > v_due then
    raise exception 'gift_card_exceeds_due' using errcode = 'P0001', detail = v_due::text;
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

  if public.business_has_feature(p_business_id, 'finance') then
    insert into public.payments (business_id, appointment_id, customer_id, amount_cents, currency, method, note, recorded_by)
    values (p_business_id, p_appointment_id, v_customer, p_amount_cents, v_card.currency, 'voucher',
      'Gift card #' || v_card.number, (select auth.uid()))
    returning id into v_payment;
  end if;

  insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents,
    appointment_id, order_id, payment_id, actor_user_id, idempotency_key)
  values (p_business_id, v_card.id, 'redeem', -p_amount_cents, v_card.balance_cents - p_amount_cents,
    p_appointment_id, p_order_id, v_payment, (select auth.uid()), p_idempotency_key)
  returning id into v_tx;

  return jsonb_build_object('transaction_id', v_tx, 'number', v_card.number,
    'balance_cents', v_card.balance_cents - p_amount_cents, 'currency', v_card.currency, 'payment_id', v_payment);
end;
$$;

-- ── Selling at the desk (replaces the first version) ────────────────────────
drop function public.create_desk_gift_card(uuid, integer, public.payment_method, text, text, text, text);

create function public.create_desk_gift_card(
  p_business_id uuid,
  p_amount_cents integer,
  p_method public.payment_method,
  p_buyer_name text,
  p_buyer_email text default null,
  p_recipient_name text default null,
  p_message text default null,
  p_idempotency_key uuid default null
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
  if p_method is null or p_method = 'voucher' then
    raise exception 'gift_card_method_invalid' using errcode = 'P0001';
  end if;
  -- A retried sale returns the card it already created. Its code was shown the first
  -- time and is not stored, so it can't be returned again.
  if p_idempotency_key is not null then
    select * into v_card from public.gift_cards
    where business_id = p_business_id and idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('gift_card_id', v_card.id, 'number', v_card.number, 'code', null, 'duplicate', true);
    end if;
  end if;

  insert into public.gift_cards (business_id, source, initial_cents, currency, buyer_name, buyer_email,
    recipient_name, message, idempotency_key)
  select p_business_id, 'desk', p_amount_cents, b.currency, btrim(p_buyer_name), nullif(btrim(p_buyer_email), ''),
    nullif(btrim(p_recipient_name), ''), nullif(btrim(p_message), ''), p_idempotency_key
  from public.businesses b where b.id = p_business_id
  returning * into v_card;

  return jsonb_build_object('gift_card_id', v_card.id, 'number', v_card.number,
    'code', public.gift_card_activate_locked(v_card, p_method));
end;
$$;

-- ── Adjusting (replaces the first version) ──────────────────────────────────
drop function public.adjust_gift_card(uuid, integer, text);

create function public.adjust_gift_card(
  p_gift_card_id uuid,
  p_amount_cents integer,
  p_reason text,
  p_idempotency_key uuid default null
)
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
  if p_idempotency_key is not null and exists (
    select 1 from public.gift_card_transactions
    where business_id = v_card.business_id and idempotency_key = p_idempotency_key
  ) then
    return;
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
  insert into public.gift_card_transactions (business_id, gift_card_id, kind, amount_cents, balance_after_cents,
    reason, actor_user_id, idempotency_key)
  values (v_card.business_id, v_card.id, 'adjustment', p_amount_cents, v_card.balance_cents + p_amount_cents,
    v_reason, (select auth.uid()), p_idempotency_key);
  perform public.log_audit_event(v_card.business_id, 'gift_card.adjusted', 'gift_card', v_card.id::text,
    jsonb_build_object('number', v_card.number, 'amount_cents', p_amount_cents, 'reason', v_reason));
end;
$$;

-- ── 3. Redemption payments are refunded only through a reversal ─────────────
create or replace function public.reverse_gift_card_redemption(p_transaction_id bigint, p_reason text)
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

  -- The only path allowed to refund a redemption's payment (see the trigger below).
  perform set_config('noryx.gift_card_reversal', 'on', true);
  update public.payments set status = 'refunded', refunded_at = now(), refunded_by = (select auth.uid())
  where id = v_tx.payment_id and status = 'recorded';
  perform set_config('noryx.gift_card_reversal', 'off', true);

  perform public.log_audit_event(v_card.business_id, 'gift_card.redemption_reversed', 'gift_card', v_card.id::text,
    jsonb_build_object('number', v_card.number, 'amount_cents', -v_tx.amount_cents, 'reason', v_reason));
end;
$$;

create function public.protect_gift_card_payments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('noryx.gift_card_reversal', true), 'off') <> 'on'
     and exists (select 1 from public.gift_card_transactions t where t.payment_id = old.id) then
    raise exception 'payment_linked_to_gift_card' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger payments_protect_gift_card
before update on public.payments
for each row execute function public.protect_gift_card_payments();

-- ── Grants ──────────────────────────────────────────────────────────────────
revoke execute on function public.gift_card_due_cents(uuid, uuid, uuid) from public, anon, authenticated;
revoke execute on function public.protect_gift_card_payments() from public, anon, authenticated;
revoke execute on function public.gift_card_purchase_due(uuid, uuid, uuid) from public, anon;
revoke execute on function public.redeem_gift_card(uuid, text, integer, uuid, uuid, uuid) from public, anon;
revoke execute on function public.create_desk_gift_card(uuid, integer, public.payment_method, text, text, text, text, uuid) from public, anon;
revoke execute on function public.adjust_gift_card(uuid, integer, text, uuid) from public, anon;
grant execute on function public.gift_card_purchase_due(uuid, uuid, uuid) to authenticated;
grant execute on function public.redeem_gift_card(uuid, text, integer, uuid, uuid, uuid) to authenticated;
grant execute on function public.create_desk_gift_card(uuid, integer, public.payment_method, text, text, text, text, uuid) to authenticated;
grant execute on function public.adjust_gift_card(uuid, integer, text, uuid) to authenticated;
