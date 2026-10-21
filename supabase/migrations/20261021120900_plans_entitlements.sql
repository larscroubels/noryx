-- Subscription plans and feature entitlements (billing provider not integrated).
--
-- Plans are data, not code: limits and features live in public.plans and are
-- read through business_has_feature() / business_plan_limit(). Hard limits are
-- enforced in the database. No payment is taken and no invoice is created —
-- subscriptions are assigned by platform administrators until billing exists.

create table public.plans (
  id text primary key check (id ~ '^[a-z_]+$'),
  name text not null,
  description text not null,
  monthly_price_cents integer check (monthly_price_cents is null or monthly_price_cents >= 0),
  currency text not null default 'EUR',
  max_staff integer check (max_staff is null or max_staff > 0),
  max_members integer check (max_members is null or max_members > 0),
  features text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0
);

insert into public.plans (id, name, description, monthly_price_cents, max_staff, max_members, features, sort_order) values
  ('early_access', 'Early access', 'Every feature while NORYX is in early access. Billing starts only once plans are announced.', null, null, null,
    '{online_booking,shop,finance,team_permissions}', 0),
  ('solo', 'Solo', 'For independent professionals: one bookable professional and online booking.', null, 1, 2,
    '{online_booking}', 1),
  ('salon', 'Salon', 'For growing salons: up to 8 professionals, webshop and finance overview.', null, 8, 10,
    '{online_booking,shop,finance}', 2),
  ('studio', 'Studio', 'For larger teams: unlimited professionals and custom team permissions.', null, null, null,
    '{online_booking,shop,finance,team_permissions}', 3);

create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled');

create table public.business_subscriptions (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  billing_provider text,
  billing_reference text,
  updated_at timestamptz not null default now()
);

create trigger business_subscriptions_set_updated_at
before update on public.business_subscriptions
for each row execute function public.set_updated_at();

-- Every new business starts on early access.
create function public.assign_default_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.business_subscriptions (business_id, plan_id, status)
  values (new.id, 'early_access', 'trialing')
  on conflict (business_id) do nothing;
  return new;
end;
$$;

create trigger businesses_assign_subscription
after insert on public.businesses
for each row execute function public.assign_default_subscription();

insert into public.business_subscriptions (business_id, plan_id, status)
select id, 'early_access', 'trialing' from public.businesses
on conflict (business_id) do nothing;

-- Central entitlement checks.
create function public.business_has_feature(p_business_id uuid, p_feature text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_subscriptions s
    join public.plans p on p.id = s.plan_id
    where s.business_id = p_business_id
      and s.status in ('trialing', 'active', 'past_due')
      and p_feature = any (p.features)
  );
$$;

create function public.business_plan_limit(p_business_id uuid, p_limit text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case p_limit when 'max_staff' then p.max_staff when 'max_members' then p.max_members end
  from public.business_subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.business_id = p_business_id;
$$;

-- Hard limits.
create function public.enforce_staff_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := public.business_plan_limit(new.business_id, 'max_staff');
begin
  if new.is_active and v_limit is not null and (
    select count(*) from public.staff_members
    where business_id = new.business_id and is_active and id <> new.id
  ) >= v_limit then
    raise exception 'plan_limit_staff' using errcode = 'P0001', detail = format('Your plan includes %s professional(s).', v_limit);
  end if;
  return new;
end;
$$;

create trigger staff_members_enforce_plan_limit
before insert or update of is_active on public.staff_members
for each row execute function public.enforce_staff_limit();

create function public.enforce_member_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := public.business_plan_limit(new.business_id, 'max_members');
begin
  if v_limit is not null and (
    select count(*) from public.business_members where business_id = new.business_id and status = 'active'
  ) >= v_limit then
    raise exception 'plan_limit_members' using errcode = 'P0001', detail = format('Your plan includes %s team login(s).', v_limit);
  end if;
  return new;
end;
$$;

create trigger business_members_enforce_plan_limit
before insert on public.business_members
for each row execute function public.enforce_member_limit();

-- The webshop can only be switched on with the shop feature; losing it switches the shop off.
create function public.enforce_shop_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.shop_enabled and not coalesce(old.shop_enabled, false) and not public.business_has_feature(new.id, 'shop') then
    raise exception 'plan_feature_shop' using errcode = 'P0001', detail = 'The webshop is not included in your plan.';
  end if;
  return new;
end;
$$;

create trigger businesses_enforce_shop_entitlement
before update of shop_enabled on public.businesses
for each row execute function public.enforce_shop_entitlement();

create function public.sync_plan_features()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.business_has_feature(new.business_id, 'shop') then
    update public.businesses set shop_enabled = false where id = new.business_id and shop_enabled;
  end if;
  return new;
end;
$$;

create trigger business_subscriptions_sync_features
after insert or update on public.business_subscriptions
for each row execute function public.sync_plan_features();

-- Platform admins assign plans (until a billing provider manages this).
create function public.admin_set_subscription(
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
  select plan_id, status into v_previous from public.business_subscriptions where business_id = p_business_id;
  insert into public.business_subscriptions (business_id, plan_id, status)
  values (p_business_id, p_plan_id, p_status)
  on conflict (business_id) do update set plan_id = excluded.plan_id, status = excluded.status;
  perform public.log_audit_event(p_business_id, 'subscription.changed', 'subscription', p_business_id::text,
    jsonb_build_object('from_plan', v_previous.plan_id, 'from_status', v_previous.status,
      'to_plan', p_plan_id, 'to_status', p_status, 'reason', btrim(p_reason)));
end;
$$;

alter table public.plans enable row level security;
alter table public.business_subscriptions enable row level security;

create policy "plans: readable" on public.plans for select to authenticated using (true);
create policy "business_subscriptions: members and platform admins read" on public.business_subscriptions for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());

revoke all on table public.plans, public.business_subscriptions from anon, authenticated;
grant select on public.plans, public.business_subscriptions to authenticated;

revoke execute on function public.assign_default_subscription() from public, anon, authenticated;
revoke execute on function public.enforce_staff_limit() from public, anon, authenticated;
revoke execute on function public.enforce_member_limit() from public, anon, authenticated;
revoke execute on function public.enforce_shop_entitlement() from public, anon, authenticated;
revoke execute on function public.sync_plan_features() from public, anon, authenticated;
revoke execute on function public.admin_set_subscription(uuid, text, public.subscription_status, text) from public, anon;
grant execute on function public.admin_set_subscription(uuid, text, public.subscription_status, text) to authenticated;
