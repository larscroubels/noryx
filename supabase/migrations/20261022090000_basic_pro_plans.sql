-- Basic and Pro plans with a 14-day Pro trial.
--
-- Prices are not set yet (monthly_price_cents stays NULL) and no billing provider
-- is integrated: nobody is charged. When a trial ends without a paid plan, the
-- business continues on Basic (see business_effective_plan()).
--
--   basic — the booking system: online booking, calendar, services, staff schedules,
--           team, and at most 250 customers.
--   pro   — everything in Basic, unlimited customers, payments & finance, products &
--           stock, the webshop, booking-page branding and custom team permissions.

alter table public.plans
  add column max_customers integer check (max_customers is null or max_customers > 0);

insert into public.plans (id, name, description, monthly_price_cents, max_staff, max_members, max_customers, features, sort_order) values
  ('basic', 'Basic', 'The booking system: online booking, calendar, services, team schedules and up to 250 customers.',
    null, null, null, 250, '{online_booking}', 0),
  ('pro', 'Pro', 'Everything in Basic plus unlimited customers, payments and finance, stock, webshop and your own booking-page branding.',
    null, null, null, null, '{online_booking,finance,inventory,shop,branding,team_permissions}', 1);

-- Existing subscriptions move to the closest new plan; open trials become a 14-day Pro trial.
update public.business_subscriptions
set plan_id = case when plan_id = 'solo' then 'basic' else 'pro' end,
    trial_ends_at = case when status = 'trialing' then coalesce(trial_ends_at, now() + interval '14 days') else trial_ends_at end
where plan_id in ('early_access', 'solo', 'salon', 'studio');

delete from public.plans where id in ('early_access', 'solo', 'salon', 'studio');

-- Every new business starts with a 14-day Pro trial.
create or replace function public.assign_default_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.business_subscriptions (business_id, plan_id, status, trial_ends_at)
  values (new.id, 'pro', 'trialing', now() + interval '14 days')
  on conflict (business_id) do nothing;
  return new;
end;
$$;

-- The plan that currently applies: an expired trial falls back to Basic, a cancelled
-- subscription has no plan. Internal; members read it through current_plan().
create function public.business_effective_plan(p_business_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when s.status = 'cancelled' then null
    when s.status = 'trialing' and s.trial_ends_at is not null and s.trial_ends_at <= now() then 'basic'
    else s.plan_id
  end
  from public.business_subscriptions s
  where s.business_id = p_business_id;
$$;

create or replace function public.business_has_feature(p_business_id uuid, p_feature text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select p_feature = any (p.features)
    from public.plans p
    where p.id = public.business_effective_plan(p_business_id)
  ), false);
$$;

create or replace function public.business_plan_limit(p_business_id uuid, p_limit text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case p_limit
    when 'max_staff' then p.max_staff
    when 'max_members' then p.max_members
    when 'max_customers' then p.max_customers
  end
  from public.business_subscriptions s
  join public.plans p on p.id = coalesce(public.business_effective_plan(s.business_id), s.plan_id)
  where s.business_id = p_business_id;
$$;

-- For the workspace UI: the effective plan, only for members and platform admins.
create function public.current_plan(p_business_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select public.business_effective_plan(p_business_id)
  where public.is_business_member(p_business_id) or public.is_platform_admin();
$$;

-- ── Hard limits and feature gates ───────────────────────────────────────────

create function public.enforce_customer_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := public.business_plan_limit(new.business_id, 'max_customers');
begin
  if v_limit is not null and (
    select count(*) from public.customers where business_id = new.business_id
  ) >= v_limit then
    raise exception 'plan_limit_customers' using errcode = 'P0001', detail = format('Your plan includes %s customers.', v_limit);
  end if;
  return new;
end;
$$;

create trigger customers_enforce_plan_limit
before insert on public.customers
for each row execute function public.enforce_customer_limit();

-- Generic gate: the row's business must have the feature named in the trigger argument.
create function public.enforce_plan_feature()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.business_has_feature(new.business_id, tg_argv[0]) then
    raise exception '%', 'plan_feature_' || tg_argv[0] using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger payments_enforce_plan_feature
before insert on public.payments
for each row execute function public.enforce_plan_feature('finance');

create trigger expenses_enforce_plan_feature
before insert on public.expenses
for each row execute function public.enforce_plan_feature('finance');

create trigger products_enforce_plan_feature
before insert on public.products
for each row execute function public.enforce_plan_feature('inventory');

-- Manual stock changes need the stock feature; order reservations and cancellations
-- are handled by the order functions, so an old order can still be cancelled.
create trigger inventory_movements_enforce_plan_feature
before insert on public.inventory_movements
for each row when (new.reason not in ('order', 'order_cancelled'))
execute function public.enforce_plan_feature('inventory');

-- Orders also need the webshop feature (covers trials that ended while the shop was on).
create function public.enforce_order_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.business_has_feature(new.business_id, 'shop') then
    raise exception 'shop_unavailable' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger orders_enforce_plan_feature
before insert on public.orders
for each row execute function public.enforce_order_entitlement();

-- Logo, cover photo and accent colour are Pro; removing them is always allowed.
create function public.enforce_branding_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    (new.logo_path is not null and new.logo_path is distinct from old.logo_path)
    or (new.cover_path is not null and new.cover_path is distinct from old.cover_path)
    or (new.brand_color is not null and new.brand_color is distinct from old.brand_color)
  ) and not public.business_has_feature(new.id, 'branding') then
    raise exception 'plan_feature_branding' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger businesses_enforce_branding_entitlement
before update of logo_path, cover_path, brand_color on public.businesses
for each row execute function public.enforce_branding_entitlement();

-- Per-member permission changes are Pro; switching back to the role defaults is always allowed.
create function public.enforce_team_permissions_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.granted_permissions is distinct from old.granted_permissions
      or new.revoked_permissions is distinct from old.revoked_permissions)
    and (cardinality(new.granted_permissions) > 0 or cardinality(new.revoked_permissions) > 0)
    and not public.business_has_feature(new.business_id, 'team_permissions') then
    raise exception 'plan_feature_team_permissions' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger business_members_enforce_team_permissions
before update of granted_permissions, revoked_permissions on public.business_members
for each row execute function public.enforce_team_permissions_entitlement();

-- ── Public pages follow the plan too ────────────────────────────────────────

-- Without the branding feature the public page uses the NORYX defaults.
alter function public.get_public_business(text) rename to get_public_business_data;
revoke execute on function public.get_public_business_data(text) from public, anon, authenticated;

create function public.get_public_business(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when data is null or public.business_has_feature((data ->> 'id')::uuid, 'branding') then data
    else data || jsonb_build_object('logo_path', null, 'cover_path', null, 'brand_color', null)
  end
  from public.get_public_business_data(p_slug) as data;
$$;

create or replace function public.get_public_products(p_slug text)
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
  where b.slug = lower(p_slug) and b.status = 'active' and b.shop_enabled
    and public.business_has_feature(b.id, 'shop')
    and p.is_active and p.is_online;
$$;

-- ── Platform admins: starting a trial gives 14 days ─────────────────────────

create or replace function public.admin_set_subscription(
  p_business_id uuid,
  p_plan_id text,
  p_status public.subscription_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous record;
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;
  select plan_id, status, trial_ends_at into v_previous from public.business_subscriptions where business_id = p_business_id;
  insert into public.business_subscriptions (business_id, plan_id, status, trial_ends_at)
  values (p_business_id, p_plan_id, p_status, case when p_status = 'trialing' then now() + interval '14 days' end)
  on conflict (business_id) do update set
    plan_id = excluded.plan_id,
    status = excluded.status,
    trial_ends_at = case
      when excluded.status <> 'trialing' then business_subscriptions.trial_ends_at
      when business_subscriptions.status = 'trialing' then business_subscriptions.trial_ends_at
      else excluded.trial_ends_at
    end;
  perform public.log_audit_event(p_business_id, 'subscription.changed', 'subscription', p_business_id::text,
    jsonb_build_object('from_plan', v_previous.plan_id, 'from_status', v_previous.status,
      'to_plan', p_plan_id, 'to_status', p_status, 'reason', btrim(p_reason)));
end;
$$;

revoke execute on function public.business_effective_plan(uuid) from public, anon, authenticated;
revoke execute on function public.current_plan(uuid) from public, anon;
grant execute on function public.current_plan(uuid) to authenticated;
revoke execute on function public.enforce_customer_limit() from public, anon, authenticated;
revoke execute on function public.enforce_plan_feature() from public, anon, authenticated;
revoke execute on function public.enforce_order_entitlement() from public, anon, authenticated;
revoke execute on function public.enforce_branding_entitlement() from public, anon, authenticated;
revoke execute on function public.enforce_team_permissions_entitlement() from public, anon, authenticated;
revoke execute on function public.get_public_business(text) from public;
grant execute on function public.get_public_business(text) to anon, authenticated;
