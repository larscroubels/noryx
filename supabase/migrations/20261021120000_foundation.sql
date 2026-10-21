-- ════════════════════════════════════════════════════════════════════════════
-- NORYX foundation: identity, tenancy, roles & permissions, locations, audit log
--
-- Security model
--   * Every business-owned row carries business_id. Row-level security (RLS) is
--     enabled on every table; access is granted only through the helper
--     functions below, which check the caller's active membership.
--   * Table privileges are granted explicitly (nothing relies on Supabase's
--     default grants), and anon receives no direct table access at all.
--   * Writes that must be atomic or need elevated checks (creating a business,
--     changing a business's status) go through SECURITY DEFINER functions with
--     an empty search_path.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Enums ───────────────────────────────────────────────────────────────────
create type public.business_type as enum (
  'hair_salon',
  'barbershop',
  'beauty_salon',
  'nail_studio',
  'lash_brow_studio',
  'skincare_clinic',
  'independent_professional',
  'other'
);

create type public.business_status as enum ('active', 'suspended', 'closed');
create type public.member_role as enum ('owner', 'manager', 'staff');
create type public.member_status as enum ('active', 'disabled');

-- ── Shared trigger: keep updated_at current ─────────────────────────────────
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Profiles (one per auth user; email stays in auth.users) ────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) between 1 and 120),
  avatar_path text,
  locale text not null default 'en' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(btrim(left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120)), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ── Platform administrators (managed by the operator, never self-service) ──
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  note text
);

-- ── Businesses (tenants) ────────────────────────────────────────────────────
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  business_type public.business_type not null default 'other',
  status public.business_status not null default 'active',
  description text check (description is null or char_length(description) <= 1000),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 32),
  website_url text check (website_url is null or website_url ~* '^https?://'),
  instagram_handle text check (instagram_handle is null or instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  country_code text not null default 'BE' check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'Europe/Brussels',
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  locale text not null default 'nl-BE' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  logo_path text,
  cover_path text,
  brand_color text check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  onboarding_completed_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

-- Rejects unknown IANA time zones (a CHECK constraint cannot query pg_timezone_names).
create function public.validate_business_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Unknown time zone: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger businesses_validate_timezone
before insert or update of timezone on public.businesses
for each row execute function public.validate_business_timezone();

-- ── Permission catalogue and role defaults ──────────────────────────────────
-- Mirrored in src/lib/auth/permissions.ts; a test asserts both stay identical.
create table public.permissions (
  key text primary key check (key ~ '^[a-z_]+\.[a-z_]+$'),
  description text not null
);

create table public.role_permissions (
  role public.member_role not null,
  permission text not null references public.permissions (key) on delete cascade,
  primary key (role, permission)
);

insert into public.permissions (key, description) values
  ('settings.manage', 'Edit the business profile, branding, locations, opening hours and booking policies'),
  ('members.manage', 'Invite team members and change their roles and permissions'),
  ('staff.manage', 'Manage all staff profiles, schedules and time off'),
  ('schedule.manage_own', 'Manage your own working hours and time off'),
  ('services.manage', 'Create and edit services, categories and prices'),
  ('appointments.view_all', 'View every appointment in the business'),
  ('appointments.view_own', 'View appointments assigned to you'),
  ('appointments.manage_all', 'Create, reschedule and update any appointment'),
  ('appointments.manage_own', 'Update appointments assigned to you'),
  ('customers.view', 'View all customer records'),
  ('customers.manage', 'Create, edit, export and delete customer records'),
  ('customers.notes', 'Read and write private customer notes'),
  ('products.manage', 'Manage retail products'),
  ('inventory.manage', 'Adjust stock levels'),
  ('orders.manage', 'View and process webshop orders'),
  ('finance.view', 'View revenue, expenses and financial summaries'),
  ('finance.manage', 'Record expenses and financial transactions'),
  ('reports.view', 'View business reports'),
  ('billing.manage', 'Manage the NORYX subscription and billing details'),
  ('audit.view', 'View the business audit log');

-- Owners implicitly hold every permission and are not listed here.
insert into public.role_permissions (role, permission) values
  ('manager', 'staff.manage'),
  ('manager', 'schedule.manage_own'),
  ('manager', 'services.manage'),
  ('manager', 'appointments.view_all'),
  ('manager', 'appointments.view_own'),
  ('manager', 'appointments.manage_all'),
  ('manager', 'appointments.manage_own'),
  ('manager', 'customers.view'),
  ('manager', 'customers.manage'),
  ('manager', 'customers.notes'),
  ('manager', 'products.manage'),
  ('manager', 'inventory.manage'),
  ('manager', 'orders.manage'),
  ('manager', 'reports.view'),
  ('staff', 'schedule.manage_own'),
  ('staff', 'appointments.view_own'),
  ('staff', 'appointments.manage_own');

-- ── Business memberships (who may sign in to a business workspace) ─────────
create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null,
  status public.member_status not null default 'active',
  granted_permissions text[] not null default '{}',
  revoked_permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index business_members_user_id_idx on public.business_members (user_id);

create trigger business_members_set_updated_at
before update on public.business_members
for each row execute function public.set_updated_at();

create function public.validate_member_permissions()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from unnest(new.granted_permissions || new.revoked_permissions) as p (key)
    where not exists (select 1 from public.permissions where permissions.key = p.key)
  ) then
    raise exception 'Unknown permission in member overrides' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger business_members_validate_permissions
before insert or update of granted_permissions, revoked_permissions on public.business_members
for each row execute function public.validate_member_permissions();

-- A business must always keep at least one active owner.
create function public.ensure_business_keeps_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role <> 'owner' or old.status <> 'active' then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.role = 'owner' and new.status = 'active' then
    return new;
  end if;
  -- Deleting the whole business cascades to its members; allow that.
  if not exists (select 1 from public.businesses where id = old.business_id) then
    return coalesce(new, old);
  end if;
  if not exists (
    select 1 from public.business_members
    where business_id = old.business_id
      and id <> old.id
      and role = 'owner'
      and status = 'active'
  ) then
    raise exception 'A business must keep at least one active owner' using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger business_members_keep_owner
before update or delete on public.business_members
for each row execute function public.ensure_business_keeps_owner();

-- ── Authorisation helpers used by RLS policies ──────────────────────────────
create function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create function public.has_business_permission(p_business_id uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members m
    where m.business_id = p_business_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and (
        m.role = 'owner'
        or (
          not (p_permission = any (m.revoked_permissions))
          and (
            p_permission = any (m.granted_permissions)
            or exists (
              select 1 from public.role_permissions rp
              where rp.role = m.role and rp.permission = p_permission
            )
          )
        )
      )
  );
$$;

-- Write access additionally requires the business to be active (suspended
-- businesses stay readable so owners can still view and export their data).
create function public.can_manage(p_business_id uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_business_permission(p_business_id, p_permission)
     and exists (select 1 from public.businesses where id = p_business_id and status = 'active');
$$;

-- Effective permission keys for the caller in one business (used by the app UI).
create function public.my_business_permissions(p_business_id uuid)
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(p.key order by p.key), '{}')
  from public.permissions p
  where public.has_business_permission(p_business_id, p.key);
$$;

create function public.shares_business_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members mine
    join public.business_members theirs on theirs.business_id = mine.business_id
    where mine.user_id = (select auth.uid())
      and mine.status = 'active'
      and theirs.user_id = p_user_id
  );
$$;

-- ── Locations ───────────────────────────────────────────────────────────────
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  address_line1 text check (address_line1 is null or char_length(address_line1) <= 200),
  address_line2 text check (address_line2 is null or char_length(address_line2) <= 200),
  postal_code text check (postal_code is null or char_length(postal_code) <= 20),
  city text check (city is null or char_length(city) <= 120),
  country_code text not null default 'BE' check (country_code ~ '^[A-Z]{2}$'),
  phone text check (phone is null or char_length(phone) <= 32),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Lets child tables reference (business_id, location_id) so a row can never
  -- point at another tenant's location.
  unique (business_id, id)
);

create index locations_business_id_idx on public.locations (business_id);

create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

-- ── Audit log ───────────────────────────────────────────────────────────────
create table public.audit_events (
  id bigint generated always as identity primary key,
  business_id uuid references public.businesses (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null check (action ~ '^[a-z_]+(\.[a-z_]+)+$'),
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_business_created_idx on public.audit_events (business_id, created_at desc);
create index audit_events_created_idx on public.audit_events (created_at desc);

-- Internal only: called from other SECURITY DEFINER functions, never exposed.
create function public.log_audit_event(
  p_business_id uuid,
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_events (business_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (p_business_id, (select auth.uid()), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
$$;

-- ── Business creation (atomic: business + owner membership + first location) ─
create function public.create_business(
  p_name text,
  p_slug text,
  p_business_type public.business_type default 'other',
  p_timezone text default 'Europe/Brussels',
  p_country_code text default 'BE',
  p_currency text default 'EUR',
  p_locale text default 'nl-BE'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_business_id uuid;
  v_owned integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select count(*) into v_owned
  from public.business_members
  where user_id = v_user_id and role = 'owner';

  if v_owned >= 5 and not public.is_platform_admin() then
    raise exception 'Business limit reached for this account' using errcode = '54000';
  end if;

  insert into public.businesses (name, slug, business_type, timezone, country_code, currency, locale, created_by)
  values (btrim(p_name), lower(btrim(p_slug)), p_business_type, p_timezone, upper(p_country_code), upper(p_currency), p_locale, v_user_id)
  returning id into v_business_id;

  insert into public.business_members (business_id, user_id, role)
  values (v_business_id, v_user_id, 'owner');

  insert into public.locations (business_id, name, country_code)
  values (v_business_id, btrim(p_name), upper(p_country_code));

  perform public.log_audit_event(v_business_id, 'business.created', 'business', v_business_id::text,
    jsonb_build_object('slug', lower(btrim(p_slug))));

  return v_business_id;
end;
$$;

-- ── Platform administration ─────────────────────────────────────────────────
create function public.admin_set_business_status(
  p_business_id uuid,
  p_status public.business_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous public.business_status;
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;

  select status into v_previous from public.businesses where id = p_business_id for update;
  if not found then
    raise exception 'Business not found' using errcode = 'P0002';
  end if;

  update public.businesses set status = p_status where id = p_business_id;

  perform public.log_audit_event(p_business_id, 'business.status_changed', 'business', p_business_id::text,
    jsonb_build_object('from', v_previous, 'to', p_status, 'reason', btrim(p_reason)));
end;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- Row-level security
-- ════════════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.businesses enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.business_members enable row level security;
alter table public.locations enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles: read own, co-members' and as platform admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.shares_business_with(id) or public.is_platform_admin());

create policy "profiles: update own"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "permissions: readable catalogue"
on public.permissions for select to authenticated using (true);

create policy "role_permissions: readable catalogue"
on public.role_permissions for select to authenticated using (true);

create policy "businesses: members and platform admins read"
on public.businesses for select to authenticated
using (public.is_business_member(id) or public.is_platform_admin());

create policy "businesses: settings managers update"
on public.businesses for update to authenticated
using (public.can_manage(id, 'settings.manage'))
with check (public.can_manage(id, 'settings.manage'));

create policy "business_members: co-members and platform admins read"
on public.business_members for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());

create policy "locations: members and platform admins read"
on public.locations for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());

create policy "locations: settings managers insert"
on public.locations for insert to authenticated
with check (public.can_manage(business_id, 'settings.manage'));

create policy "locations: settings managers update"
on public.locations for update to authenticated
using (public.can_manage(business_id, 'settings.manage'))
with check (public.can_manage(business_id, 'settings.manage'));

create policy "audit_events: authorised readers"
on public.audit_events for select to authenticated
using (
  public.is_platform_admin()
  or (business_id is not null and public.has_business_permission(business_id, 'audit.view'))
);

-- ════════════════════════════════════════════════════════════════════════════
-- Privileges (explicit; anon gets nothing here)
-- ════════════════════════════════════════════════════════════════════════════
revoke all on table
  public.profiles, public.platform_admins, public.businesses, public.permissions,
  public.role_permissions, public.business_members, public.locations, public.audit_events
from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, avatar_path, locale) on public.profiles to authenticated;
grant select on public.permissions, public.role_permissions to authenticated;
grant select on public.businesses to authenticated;
-- status, slug, created_by and timestamps are deliberately not updatable by clients.
grant update (
  name, business_type, description, email, phone, website_url, instagram_handle,
  country_code, timezone, currency, locale, logo_path, cover_path, brand_color,
  onboarding_completed_at
) on public.businesses to authenticated;
grant select on public.business_members to authenticated;
grant select, insert on public.locations to authenticated;
grant update (
  name, address_line1, address_line2, postal_code, city, country_code, phone, is_active, sort_order
) on public.locations to authenticated;
grant select on public.audit_events to authenticated;

-- Functions are executable by PUBLIC by default in Postgres; lock down the internal ones.
revoke execute on function public.log_audit_event(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.ensure_business_keeps_owner() from public, anon, authenticated;
revoke execute on function public.create_business(text, text, public.business_type, text, text, text, text) from public, anon;
revoke execute on function public.admin_set_business_status(uuid, public.business_status, text) from public, anon;
grant execute on function public.create_business(text, text, public.business_type, text, text, text, text) to authenticated;
grant execute on function public.admin_set_business_status(uuid, public.business_status, text) to authenticated;
