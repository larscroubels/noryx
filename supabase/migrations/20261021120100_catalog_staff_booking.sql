-- ════════════════════════════════════════════════════════════════════════════
-- NORYX core business data: opening hours, services, staff, schedules,
-- customers, appointments, notification outbox and the public booking API.
--
-- Integrity rules enforced here (not only in the app):
--   * Composite foreign keys (business_id, x_id) make cross-tenant references
--     impossible, e.g. an appointment can never point at another salon's staff.
--   * An exclusion constraint makes overlapping active appointments for the
--     same staff member impossible, even under concurrent booking attempts.
--   * Appointments snapshot service name, duration and price, so later edits
--     to a service never rewrite history.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists btree_gist with schema extensions;

-- ── Booking policies (one set per business) ─────────────────────────────────
alter table public.businesses
  add column booking_enabled boolean not null default false,
  add column booking_min_notice_minutes integer not null default 120
    check (booking_min_notice_minutes between 0 and 10080),
  add column booking_horizon_days integer not null default 60
    check (booking_horizon_days between 1 and 365),
  add column booking_slot_interval_minutes integer not null default 15
    check (booking_slot_interval_minutes in (5, 10, 15, 20, 30, 45, 60)),
  add column booking_buffer_minutes integer not null default 0
    check (booking_buffer_minutes between 0 and 120),
  add column booking_cancellation_notice_hours integer not null default 24
    check (booking_cancellation_notice_hours between 0 and 336),
  add column booking_allow_staff_choice boolean not null default true,
  add column booking_requires_approval boolean not null default false;

grant update (
  booking_enabled, booking_min_notice_minutes, booking_horizon_days, booking_slot_interval_minutes,
  booking_buffer_minutes, booking_cancellation_notice_hours, booking_allow_staff_choice,
  booking_requires_approval
) on public.businesses to authenticated;

-- ── Location opening hours (ISO weekday 1 = Monday … 7 = Sunday) ─────────────
-- Times are minutes after local midnight in the business time zone; several
-- ranges per day model a lunch closure.
create table public.location_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  location_id uuid not null,
  weekday smallint not null check (weekday between 1 and 7),
  start_minute smallint not null check (start_minute between 0 and 1439),
  end_minute smallint not null check (end_minute between 1 and 1440),
  check (end_minute > start_minute),
  foreign key (business_id, location_id) references public.locations (business_id, id) on delete cascade,
  constraint location_hours_no_overlap exclude using gist (
    location_id with =, weekday with =, int4range(start_minute, end_minute) with &&
  )
);

create index location_hours_location_idx on public.location_hours (location_id, weekday);

-- ── Services ────────────────────────────────────────────────────────────────
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, id)
);

create unique index service_categories_name_key on public.service_categories (business_id, lower(name));

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id uuid,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price_cents integer not null check (price_cents between 0 and 10000000),
  promo_price_cents integer check (promo_price_cents is null or (promo_price_cents >= 0 and promo_price_cents < price_cents)),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes between 0 and 240),
  is_active boolean not null default true,
  is_online_bookable boolean not null default true,
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id),
  foreign key (business_id, category_id)
    references public.service_categories (business_id, id) on delete set null (category_id)
);

create index services_business_idx on public.services (business_id, sort_order);

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- ── Staff (bookable professionals; optionally linked to a login) ────────────
create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  location_id uuid,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  job_title text check (job_title is null or char_length(job_title) <= 80),
  bio text check (bio is null or char_length(bio) <= 500),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 32),
  avatar_path text,
  is_bookable boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id),
  unique (business_id, user_id),
  foreign key (business_id, location_id)
    references public.locations (business_id, id) on delete set null (location_id)
);

create index staff_members_business_idx on public.staff_members (business_id, sort_order);

create trigger staff_members_set_updated_at
before update on public.staff_members
for each row execute function public.set_updated_at();

-- Which staff perform which service, with optional per-staff price/duration.
create table public.staff_services (
  business_id uuid not null,
  staff_id uuid not null,
  service_id uuid not null,
  price_cents integer check (price_cents is null or price_cents between 0 and 10000000),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 5 and 720),
  primary key (staff_id, service_id),
  foreign key (business_id, staff_id) references public.staff_members (business_id, id) on delete cascade,
  foreign key (business_id, service_id) references public.services (business_id, id) on delete cascade
);

create index staff_services_service_idx on public.staff_services (service_id);

-- Weekly working hours; gaps between ranges on the same day are breaks.
create table public.staff_working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  staff_id uuid not null,
  weekday smallint not null check (weekday between 1 and 7),
  start_minute smallint not null check (start_minute between 0 and 1439),
  end_minute smallint not null check (end_minute between 1 and 1440),
  check (end_minute > start_minute),
  foreign key (business_id, staff_id) references public.staff_members (business_id, id) on delete cascade,
  constraint staff_working_hours_no_overlap exclude using gist (
    staff_id with =, weekday with =, int4range(start_minute, end_minute) with &&
  )
);

create index staff_working_hours_staff_idx on public.staff_working_hours (staff_id, weekday);

create type public.time_off_kind as enum ('holiday', 'sick', 'break', 'training', 'other');

-- One-off absences: holidays, sick days, one-time breaks.
create table public.staff_time_off (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  staff_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  kind public.time_off_kind not null default 'holiday',
  note text check (note is null or char_length(note) <= 200),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (business_id, staff_id) references public.staff_members (business_id, id) on delete cascade
);

create index staff_time_off_staff_idx on public.staff_time_off (staff_id, starts_at);

-- ── Customers ───────────────────────────────────────────────────────────────
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 80),
  last_name text check (last_name is null or char_length(last_name) <= 80),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 32),
  marketing_opt_in boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'online_booking', 'import')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

-- Duplicate prevention: one record per email address within a business.
create unique index customers_business_email_key on public.customers (business_id, lower(email)) where email is not null;
create index customers_business_name_idx on public.customers (business_id, lower(first_name), lower(last_name));

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

-- Private notes live in their own table so they can be protected separately.
create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  customer_id uuid not null,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (business_id, customer_id) references public.customers (business_id, id) on delete cascade
);

create index customer_notes_customer_idx on public.customer_notes (customer_id, created_at desc);

-- ── Appointments ────────────────────────────────────────────────────────────
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.appointment_source as enum ('online', 'staff');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  location_id uuid not null,
  staff_id uuid not null,
  customer_id uuid not null,
  service_id uuid,
  -- Snapshot of the service at booking time (history survives later edits).
  service_name text not null check (char_length(service_name) between 1 and 120),
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price_cents integer not null check (price_cents >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- End of the period the staff member is unavailable (appointment + buffer).
  blocked_until timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  source public.appointment_source not null default 'staff',
  customer_note text check (customer_note is null or char_length(customer_note) <= 1000),
  internal_note text check (internal_note is null or char_length(internal_note) <= 2000),
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by is null or cancelled_by in ('customer', 'business')),
  cancellation_reason text check (cancellation_reason is null or char_length(cancellation_reason) <= 500),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (blocked_until >= ends_at),
  foreign key (business_id, location_id) references public.locations (business_id, id),
  foreign key (business_id, staff_id) references public.staff_members (business_id, id),
  foreign key (business_id, customer_id) references public.customers (business_id, id),
  foreign key (business_id, service_id)
    references public.services (business_id, id) on delete set null (service_id),
  constraint appointments_no_overlap exclude using gist (
    staff_id with =, tstzrange(starts_at, blocked_until, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create index appointments_business_start_idx on public.appointments (business_id, starts_at);
create index appointments_staff_start_idx on public.appointments (staff_id, starts_at);
create index appointments_customer_start_idx on public.appointments (customer_id, starts_at desc);

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- Allowed status transitions; cancelled is final (book again instead).
create function public.validate_appointment_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not (
      (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
      or (old.status = 'confirmed' and new.status in ('completed', 'cancelled', 'no_show'))
      or (old.status in ('completed', 'no_show') and new.status = 'confirmed')
    ) then
      raise exception 'Cannot change an appointment from % to %', old.status, new.status
        using errcode = '22023';
    end if;
  end if;

  if new.status = 'cancelled' and (tg_op = 'INSERT' or old.status <> 'cancelled') then
    new.cancelled_at := coalesce(new.cancelled_at, now());
  end if;

  if tg_op = 'UPDATE' and old.status = 'cancelled' and (
    new.starts_at <> old.starts_at or new.staff_id <> old.staff_id
  ) then
    raise exception 'Cancelled appointments cannot be rescheduled' using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger appointments_validate_status
before insert or update on public.appointments
for each row execute function public.validate_appointment_status();

-- Appointment history: creation, status changes and reschedules.
create table public.appointment_events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  event text not null check (event in ('created', 'status_changed', 'rescheduled')),
  from_status public.appointment_status,
  to_status public.appointment_status,
  previous_starts_at timestamptz,
  new_starts_at timestamptz,
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index appointment_events_appointment_idx on public.appointment_events (appointment_id, created_at);

create function public.record_appointment_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_events (business_id, appointment_id, event, to_status, new_starts_at, actor_user_id)
    values (new.business_id, new.id, 'created', new.status, new.starts_at, (select auth.uid()));
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.appointment_events (business_id, appointment_id, event, from_status, to_status, actor_user_id)
    values (new.business_id, new.id, 'status_changed', old.status, new.status, (select auth.uid()));
  end if;

  if new.starts_at is distinct from old.starts_at or new.staff_id is distinct from old.staff_id then
    insert into public.appointment_events (business_id, appointment_id, event, previous_starts_at, new_starts_at, actor_user_id)
    values (new.business_id, new.id, 'rescheduled', old.starts_at, new.starts_at, (select auth.uid()));
  end if;

  return new;
end;
$$;

create trigger appointments_record_event
after insert or update on public.appointments
for each row execute function public.record_appointment_event();

-- ── Notification outbox ─────────────────────────────────────────────────────
-- Rows are written when something should be communicated. A worker delivers
-- them through a configured provider; without one they are marked 'skipped'
-- with the reason, so the app never claims a message was sent when it wasn't.
create type public.notification_channel as enum ('email', 'sms');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'skipped');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  channel public.notification_channel not null default 'email',
  template text not null check (template ~ '^[a-z_]+$'),
  recipient text not null,
  appointment_id uuid references public.appointments (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index notifications_pending_idx on public.notifications (created_at) where status = 'pending';
create index notifications_business_idx on public.notifications (business_id, created_at desc);

-- ── Helpers ─────────────────────────────────────────────────────────────────
create function public.is_own_staff(p_staff_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_members
    where id = p_staff_id and user_id = (select auth.uid()) and is_active
  );
$$;

create function public.can_view_appointment(p_business_id uuid, p_staff_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_business_permission(p_business_id, 'appointments.view_all')
      or (public.has_business_permission(p_business_id, 'appointments.view_own') and public.is_own_staff(p_staff_id));
$$;

create function public.can_manage_appointment(p_business_id uuid, p_staff_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.can_manage(p_business_id, 'appointments.manage_all')
      or (public.can_manage(p_business_id, 'appointments.manage_own') and public.is_own_staff(p_staff_id));
$$;

create function public.can_view_customer(p_business_id uuid, p_customer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_business_permission(p_business_id, 'customers.view')
      or (
        public.has_business_permission(p_business_id, 'appointments.view_own')
        and exists (
          select 1
          from public.appointments a
          join public.staff_members s on s.id = a.staff_id
          where a.customer_id = p_customer_id and s.user_id = (select auth.uid())
        )
      );
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- Row-level security
-- ════════════════════════════════════════════════════════════════════════════
alter table public.location_hours enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.staff_members enable row level security;
alter table public.staff_services enable row level security;
alter table public.staff_working_hours enable row level security;
alter table public.staff_time_off enable row level security;
alter table public.customers enable row level security;
alter table public.customer_notes enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_events enable row level security;
alter table public.notifications enable row level security;

-- Opening hours
create policy "location_hours: members read" on public.location_hours for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "location_hours: settings managers write" on public.location_hours for all to authenticated
using (public.can_manage(business_id, 'settings.manage'))
with check (public.can_manage(business_id, 'settings.manage'));

-- Service catalogue
create policy "service_categories: members read" on public.service_categories for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "service_categories: service managers write" on public.service_categories for all to authenticated
using (public.can_manage(business_id, 'services.manage'))
with check (public.can_manage(business_id, 'services.manage'));

create policy "services: members read" on public.services for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "services: service managers write" on public.services for all to authenticated
using (public.can_manage(business_id, 'services.manage'))
with check (public.can_manage(business_id, 'services.manage'));

-- Staff
create policy "staff_members: members read" on public.staff_members for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "staff_members: staff managers write" on public.staff_members for all to authenticated
using (public.can_manage(business_id, 'staff.manage'))
with check (public.can_manage(business_id, 'staff.manage'));

create policy "staff_services: members read" on public.staff_services for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "staff_services: staff or service managers write" on public.staff_services for all to authenticated
using (public.can_manage(business_id, 'staff.manage') or public.can_manage(business_id, 'services.manage'))
with check (public.can_manage(business_id, 'staff.manage') or public.can_manage(business_id, 'services.manage'));

create policy "staff_working_hours: members read" on public.staff_working_hours for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "staff_working_hours: managers or own schedule write" on public.staff_working_hours for all to authenticated
using (
  public.can_manage(business_id, 'staff.manage')
  or (public.can_manage(business_id, 'schedule.manage_own') and public.is_own_staff(staff_id))
)
with check (
  public.can_manage(business_id, 'staff.manage')
  or (public.can_manage(business_id, 'schedule.manage_own') and public.is_own_staff(staff_id))
);

create policy "staff_time_off: members read" on public.staff_time_off for select to authenticated
using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "staff_time_off: managers or own schedule write" on public.staff_time_off for all to authenticated
using (
  public.can_manage(business_id, 'staff.manage')
  or (public.can_manage(business_id, 'schedule.manage_own') and public.is_own_staff(staff_id))
)
with check (
  public.can_manage(business_id, 'staff.manage')
  or (public.can_manage(business_id, 'schedule.manage_own') and public.is_own_staff(staff_id))
);

-- Customers: full list for customers.view; staff only see their own clients.
create policy "customers: authorised read" on public.customers for select to authenticated
using (public.can_view_customer(business_id, id) or public.is_platform_admin());
create policy "customers: create" on public.customers for insert to authenticated
with check (
  public.can_manage(business_id, 'customers.manage')
  or public.can_manage(business_id, 'appointments.manage_all')
  or public.can_manage(business_id, 'appointments.manage_own')
);
create policy "customers: customer managers update" on public.customers for update to authenticated
using (public.can_manage(business_id, 'customers.manage'))
with check (public.can_manage(business_id, 'customers.manage'));
create policy "customers: customer managers delete" on public.customers for delete to authenticated
using (public.can_manage(business_id, 'customers.manage'));

create policy "customer_notes: note readers" on public.customer_notes for select to authenticated
using (public.has_business_permission(business_id, 'customers.notes'));
create policy "customer_notes: note writers insert" on public.customer_notes for insert to authenticated
with check (public.can_manage(business_id, 'customers.notes') and created_by = (select auth.uid()));
create policy "customer_notes: note writers delete" on public.customer_notes for delete to authenticated
using (public.can_manage(business_id, 'customers.notes'));

-- Appointments
create policy "appointments: authorised read" on public.appointments for select to authenticated
using (public.can_view_appointment(business_id, staff_id) or public.is_platform_admin());
create policy "appointments: authorised insert" on public.appointments for insert to authenticated
with check (public.can_manage_appointment(business_id, staff_id));
create policy "appointments: authorised update" on public.appointments for update to authenticated
using (public.can_manage_appointment(business_id, staff_id))
with check (public.can_manage_appointment(business_id, staff_id));

create policy "appointment_events: follow appointment visibility" on public.appointment_events for select to authenticated
using (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id and public.can_view_appointment(a.business_id, a.staff_id)
  )
);

create policy "notifications: settings managers read" on public.notifications for select to authenticated
using (public.has_business_permission(business_id, 'settings.manage') or public.is_platform_admin());

-- ── Privileges ──────────────────────────────────────────────────────────────
revoke all on table
  public.location_hours, public.service_categories, public.services, public.staff_members,
  public.staff_services, public.staff_working_hours, public.staff_time_off, public.customers,
  public.customer_notes, public.appointments, public.appointment_events, public.notifications
from anon, authenticated;

grant select, insert, update, delete on
  public.location_hours, public.service_categories, public.services, public.staff_members,
  public.staff_services, public.staff_working_hours, public.staff_time_off
to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, delete on public.customer_notes to authenticated;
grant select, insert on public.appointments to authenticated;
-- Identity and snapshot columns of an appointment cannot be rewritten by clients.
grant update (
  staff_id, location_id, starts_at, ends_at, blocked_until, status, internal_note,
  cancelled_by, cancellation_reason
) on public.appointments to authenticated;
grant select on public.appointment_events, public.notifications to authenticated;

revoke execute on function public.record_appointment_event() from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Public booking API (SECURITY DEFINER; exposes only public, non-personal data)
-- ════════════════════════════════════════════════════════════════════════════

-- Everything a public business page needs, in one round trip. Returns NULL
-- unless the business is active and has published its booking page.
create function public.get_public_business(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', b.id,
    'slug', b.slug,
    'name', b.name,
    'business_type', b.business_type,
    'description', b.description,
    'email', b.email,
    'phone', b.phone,
    'website_url', b.website_url,
    'instagram_handle', b.instagram_handle,
    'timezone', b.timezone,
    'currency', b.currency,
    'locale', b.locale,
    'logo_path', b.logo_path,
    'cover_path', b.cover_path,
    'brand_color', b.brand_color,
    'policy', jsonb_build_object(
      'min_notice_minutes', b.booking_min_notice_minutes,
      'horizon_days', b.booking_horizon_days,
      'slot_interval_minutes', b.booking_slot_interval_minutes,
      'buffer_minutes', b.booking_buffer_minutes,
      'cancellation_notice_hours', b.booking_cancellation_notice_hours,
      'allow_staff_choice', b.booking_allow_staff_choice,
      'requires_approval', b.booking_requires_approval
    ),
    'locations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'name', l.name, 'address_line1', l.address_line1, 'address_line2', l.address_line2,
        'postal_code', l.postal_code, 'city', l.city, 'country_code', l.country_code, 'phone', l.phone,
        'hours', coalesce((
          select jsonb_agg(jsonb_build_object('weekday', h.weekday, 'start_minute', h.start_minute, 'end_minute', h.end_minute)
            order by h.weekday, h.start_minute)
          from public.location_hours h where h.location_id = l.id
        ), '[]'::jsonb)
      ) order by l.sort_order, l.name)
      from public.locations l where l.business_id = b.id and l.is_active
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.sort_order, c.name)
      from public.service_categories c where c.business_id = b.id
    ), '[]'::jsonb),
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'category_id', s.category_id, 'name', s.name, 'description', s.description,
        'duration_minutes', s.duration_minutes, 'price_cents', s.price_cents,
        'promo_price_cents', s.promo_price_cents, 'buffer_after_minutes', s.buffer_after_minutes
      ) order by s.sort_order, s.name)
      from public.services s
      where s.business_id = b.id and s.is_active and s.is_online_bookable
    ), '[]'::jsonb),
    'staff', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'display_name', m.display_name, 'job_title', m.job_title, 'bio', m.bio,
        'avatar_path', m.avatar_path, 'location_id', m.location_id,
        'services', coalesce((
          select jsonb_agg(jsonb_build_object('service_id', ss.service_id, 'price_cents', ss.price_cents, 'duration_minutes', ss.duration_minutes))
          from public.staff_services ss where ss.staff_id = m.id
        ), '[]'::jsonb),
        'hours', coalesce((
          select jsonb_agg(jsonb_build_object('weekday', w.weekday, 'start_minute', w.start_minute, 'end_minute', w.end_minute)
            order by w.weekday, w.start_minute)
          from public.staff_working_hours w where w.staff_id = m.id
        ), '[]'::jsonb)
      ) order by m.sort_order, m.display_name)
      from public.staff_members m
      where m.business_id = b.id and m.is_active and m.is_bookable
    ), '[]'::jsonb)
  )
  from public.businesses b
  where b.slug = lower(p_slug) and b.status = 'active' and b.booking_enabled;
$$;

-- Busy periods (appointments incl. buffers, and time off) for availability.
-- Returns no customer information. The window is capped at 62 days.
create function public.get_public_busy_periods(p_business_id uuid, p_from timestamptz, p_to timestamptz)
returns table (staff_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.staff_id, a.starts_at, a.blocked_until
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  where a.business_id = p_business_id
    and b.status = 'active' and b.booking_enabled
    and p_to > p_from and p_to - p_from <= interval '62 days'
    and a.status in ('pending', 'confirmed')
    and a.starts_at < p_to and a.blocked_until > p_from
  union all
  select t.staff_id, t.starts_at, t.ends_at
  from public.staff_time_off t
  join public.businesses b on b.id = t.business_id
  where t.business_id = p_business_id
    and b.status = 'active' and b.booking_enabled
    and p_to > p_from and p_to - p_from <= interval '62 days'
    and t.starts_at < p_to and t.ends_at > p_from;
$$;

-- Creates an online booking after re-validating every rule in the database.
-- Only the NORYX server (service role) may call this — it rate-limits and
-- validates input first. Overlaps are rejected by appointments_no_overlap.
create function public.create_online_booking(
  p_business_id uuid,
  p_location_id uuid,
  p_service_id uuid,
  p_staff_id uuid,
  p_starts_at timestamptz,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_customer_note text default null,
  p_marketing_opt_in boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.businesses%rowtype;
  s public.services%rowtype;
  v_duration integer;
  v_price integer;
  v_ends_at timestamptz;
  v_local timestamp;
  v_weekday smallint;
  v_start_minute integer;
  v_end_minute integer;
  v_customer_id uuid;
  v_appointment_id uuid;
  v_status public.appointment_status;
  v_email text := lower(btrim(p_email));
begin
  select * into b from public.businesses where id = p_business_id;
  if not found or b.status <> 'active' or not b.booking_enabled then
    raise exception 'booking_unavailable' using errcode = 'P0001', detail = 'Online booking is not available.';
  end if;

  select * into s from public.services
  where id = p_service_id and business_id = b.id and is_active and is_online_bookable;
  if not found then
    raise exception 'service_unavailable' using errcode = 'P0001', detail = 'This service cannot be booked online.';
  end if;

  if not exists (select 1 from public.locations where id = p_location_id and business_id = b.id and is_active) then
    raise exception 'location_unavailable' using errcode = 'P0001';
  end if;

  select coalesce(ss.duration_minutes, s.duration_minutes), coalesce(ss.price_cents, coalesce(s.promo_price_cents, s.price_cents))
  into v_duration, v_price
  from public.staff_services ss
  join public.staff_members m on m.id = ss.staff_id
  where ss.staff_id = p_staff_id and ss.service_id = s.id and m.business_id = b.id and m.is_active and m.is_bookable
    and (m.location_id is null or m.location_id = p_location_id);
  if not found then
    raise exception 'staff_unavailable' using errcode = 'P0001', detail = 'This professional does not offer this service.';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_duration);

  if p_starts_at < now() + make_interval(mins => b.booking_min_notice_minutes)
     or p_starts_at > now() + make_interval(days => b.booking_horizon_days) then
    raise exception 'outside_booking_window' using errcode = 'P0001';
  end if;

  -- Local wall-clock time in the business time zone (no midnight-spanning bookings).
  v_local := p_starts_at at time zone b.timezone;
  v_weekday := extract(isodow from v_local)::smallint;
  v_start_minute := extract(hour from v_local)::integer * 60 + extract(minute from v_local)::integer;
  v_end_minute := v_start_minute + v_duration;

  if extract(second from v_local) <> 0 or v_start_minute % b.booking_slot_interval_minutes <> 0 then
    raise exception 'invalid_slot' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.staff_working_hours w
    where w.staff_id = p_staff_id and w.weekday = v_weekday
      and w.start_minute <= v_start_minute and w.end_minute >= v_end_minute
  ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.location_hours where location_id = p_location_id)
     and not exists (
       select 1 from public.location_hours h
       where h.location_id = p_location_id and h.weekday = v_weekday
         and h.start_minute <= v_start_minute and h.end_minute >= v_end_minute
     ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.staff_time_off t
    where t.staff_id = p_staff_id and t.starts_at < v_ends_at and t.ends_at > p_starts_at
  ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  -- Reuse the existing customer record for this email address (duplicate prevention).
  insert into public.customers (business_id, first_name, last_name, email, phone, marketing_opt_in, source)
  values (b.id, btrim(p_first_name), nullif(btrim(p_last_name), ''), v_email, nullif(btrim(p_phone), ''), coalesce(p_marketing_opt_in, false), 'online_booking')
  on conflict (business_id, lower(email)) where email is not null
  do update set
    phone = coalesce(public.customers.phone, excluded.phone),
    marketing_opt_in = public.customers.marketing_opt_in or excluded.marketing_opt_in
  returning id into v_customer_id;

  v_status := case when b.booking_requires_approval then 'pending' else 'confirmed' end;

  insert into public.appointments (
    business_id, location_id, staff_id, customer_id, service_id, service_name, duration_minutes,
    price_cents, currency, starts_at, ends_at, blocked_until, status, source, customer_note
  ) values (
    b.id, p_location_id, p_staff_id, v_customer_id, s.id, s.name, v_duration,
    v_price, b.currency, p_starts_at, v_ends_at,
    v_ends_at + make_interval(mins => greatest(s.buffer_after_minutes, b.booking_buffer_minutes)),
    v_status, 'online', nullif(btrim(p_customer_note), '')
  )
  returning id into v_appointment_id;

  insert into public.notifications (business_id, channel, template, recipient, appointment_id, payload)
  values
    (b.id, 'email', case when v_status = 'pending' then 'booking_requested' else 'booking_confirmed' end,
     v_email, v_appointment_id, jsonb_build_object('audience', 'customer')),
    (b.id, 'email', 'new_online_booking', coalesce(b.email, ''), v_appointment_id, jsonb_build_object('audience', 'business'));

  return jsonb_build_object(
    'appointment_id', v_appointment_id,
    'status', v_status,
    'starts_at', p_starts_at,
    'ends_at', v_ends_at,
    'duration_minutes', v_duration,
    'price_cents', v_price
  );
end;
$$;

revoke execute on function public.get_public_business(text) from public;
revoke execute on function public.get_public_busy_periods(uuid, timestamptz, timestamptz) from public;
revoke execute on function public.create_online_booking(uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.get_public_business(text) to anon, authenticated;
grant execute on function public.get_public_busy_periods(uuid, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.create_online_booking(uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, text, boolean) to service_role;
