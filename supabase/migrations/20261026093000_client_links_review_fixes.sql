-- Review fixes for client links and bookings.

-- 1. The Basic customer limit counts new people, not repeat bookings: an upsert that
--    matches an existing customer by email no longer trips the BEFORE INSERT check.
create or replace function public.enforce_customer_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer := public.business_plan_limit(new.business_id, 'max_customers');
begin
  if new.email is not null and exists (
    select 1 from public.customers where business_id = new.business_id and lower(email) = lower(new.email)
  ) then
    return new;
  end if;
  if v_limit is not null and (
    select count(*) from public.customers where business_id = new.business_id
  ) >= v_limit then
    raise exception 'plan_limit_customers' using errcode = 'P0001', detail = format('Your plan includes %s customers.', v_limit);
  end if;
  return new;
end;
$$;

-- 2. Codes: six characters without look-alikes (0/O, 1/I) after the prefix, so a typo
--    doesn't land on another salon and a prefix can't run out. Older codes stay valid.
alter table public.business_connection_codes drop constraint business_connection_codes_code_check;
alter table public.business_connection_codes add constraint business_connection_codes_code_check
  check (code ~ '^[A-Z]{3,4}-([0-9]{4}|[2-9A-HJ-NP-Z]{6})$');

create or replace function public.new_connection_code(p_business_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_letters text;
  v_prefix text;
  v_code text;
  v_bytes bytea;
begin
  select left(regexp_replace(upper(slug), '[^A-Z]', '', 'g'), 4) into v_letters
  from public.businesses where id = p_business_id;
  v_prefix := case when length(v_letters) >= 3 then v_letters else rpad(coalesce(v_letters, ''), 3, 'X') end;
  for attempt in 1..20 loop
    v_bytes := extensions.gen_random_bytes(6);
    v_code := v_prefix || '-';
    for i in 0..5 loop
      v_code := v_code || substr(v_alphabet, get_byte(v_bytes, i) % 32 + 1, 1);
    end loop;
    if not exists (select 1 from public.business_connection_codes where code = v_code) then
      return v_code;
    end if;
  end loop;
  raise exception 'connection_code_exhausted' using errcode = 'P0001';
end;
$$;

revoke execute on function public.new_connection_code(uuid) from public, anon, authenticated;

-- 3. One live link per customer record, attempts serialised per user.
create unique index client_links_one_live_per_customer
  on public.client_links (business_id, customer_id) where unlinked_at is null;

create or replace function public.link_business_by_code(p_code text, p_categories public.client_category[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_email text;
  v_name text;
  v_confirmed boolean;
  v_business public.businesses%rowtype;
  v_customer uuid;
  v_categories public.client_category[];
begin
  if v_user is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  select lower(email), email_confirmed_at is not null into v_email, v_confirmed from auth.users where id = v_user;
  if v_confirmed is not true then
    return jsonb_build_object('error', 'email_not_confirmed');
  end if;
  -- Parallel calls would otherwise all count fewer than ten attempts.
  perform pg_advisory_xact_lock(hashtext('connection_code_attempts:' || v_user::text));
  delete from public.connection_code_attempts
  where user_id = v_user and attempted_at <= now() - interval '15 minutes';
  if (select count(*) from public.connection_code_attempts
      where user_id = v_user and attempted_at > now() - interval '15 minutes') >= 10 then
    return jsonb_build_object('error', 'too_many_attempts');
  end if;

  select b.* into v_business
  from public.business_connection_codes c
  join public.businesses b on b.id = c.business_id
  where c.code = upper(btrim(coalesce(p_code, ''))) and c.active and b.status = 'active';
  if not found then
    insert into public.connection_code_attempts (user_id) values (v_user);
    return jsonb_build_object('error', 'connection_code_invalid');
  end if;

  select array_agg(distinct c order by c) into v_categories from unnest(p_categories) c;
  if v_categories is null then
    return jsonb_build_object('error', 'categories_required');
  end if;

  -- Reuse the salon's record for this email; otherwise create one within the plan limit.
  select id into v_customer from public.customers
  where business_id = v_business.id and lower(email) = v_email;
  if v_customer is null then
    select coalesce(nullif(btrim(full_name), ''), split_part(v_email, '@', 1)) into v_name
    from public.profiles where id = v_user;
    v_name := coalesce(v_name, split_part(v_email, '@', 1));
    begin
      insert into public.customers (business_id, first_name, last_name, email, source, user_id)
      values (v_business.id, left(split_part(v_name, ' ', 1), 80),
        nullif(left(btrim(substr(v_name, length(split_part(v_name, ' ', 1)) + 1)), 80), ''),
        v_email, 'manual', v_user)
      returning id into v_customer;
    exception when others then
      if sqlerrm = 'plan_limit_customers' then
        return jsonb_build_object('error', 'plan_limit_customers');
      end if;
      raise;
    end;
  else
    -- Someone else is still linked to this record (e.g. the salon changed its email).
    if exists (
      select 1 from public.client_links
      where business_id = v_business.id and customer_id = v_customer and user_id <> v_user and unlinked_at is null
    ) then
      return jsonb_build_object('error', 'customer_already_linked');
    end if;
    update public.customers set user_id = v_user where id = v_customer and user_id is distinct from v_user;
  end if;

  insert into public.client_links (user_id, business_id, customer_id, categories)
  values (v_user, v_business.id, v_customer, v_categories)
  on conflict (user_id, business_id) do update
    set categories = excluded.categories, customer_id = excluded.customer_id, unlinked_at = null;

  return jsonb_build_object('business_id', v_business.id, 'slug', v_business.slug,
    'name', v_business.name, 'categories', to_jsonb(v_categories));
end;
$$;

-- 4. After unlinking, history ends at the moment of unlinking: visits recorded later
--    (possibly for someone else who took over the record) are not shown or cancellable.
create or replace function public.my_appointments()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'appointment_id', a.id, 'business_id', b.id, 'business_name', b.name, 'business_slug', b.slug,
    'linked', l.unlinked_at is null, 'service_name', a.service_name, 'staff_name', m.display_name,
    'starts_at', a.starts_at, 'ends_at', a.ends_at, 'price_cents', a.price_cents, 'currency', a.currency,
    'locale', b.locale, 'status', a.status,
    'can_cancel', a.status in ('pending', 'confirmed')
      and a.starts_at - make_interval(hours => b.booking_cancellation_notice_hours) > now()
  )
  from public.client_links l
  join public.appointments a on a.business_id = l.business_id and a.customer_id = l.customer_id
  join public.businesses b on b.id = l.business_id
  left join public.staff_members m on m.id = a.staff_id
  where l.user_id = (select auth.uid()) and a.created_at >= l.linked_at
    and (l.unlinked_at is null or a.created_at < l.unlinked_at)
  order by a.starts_at desc;
$$;

create or replace function public.client_cancel_appointment(p_appointment_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.appointments%rowtype;
  v_notice integer;
begin
  -- Same visibility as my_appointments.
  select ap.* into a from public.appointments ap
  join public.client_links l on l.business_id = ap.business_id and l.customer_id = ap.customer_id
  where ap.id = p_appointment_id and l.user_id = (select auth.uid()) and ap.created_at >= l.linked_at
    and (l.unlinked_at is null or ap.created_at < l.unlinked_at)
  for update of ap;
  if not found then
    raise exception 'booking_not_found' using errcode = 'P0001';
  end if;
  if a.status not in ('pending', 'confirmed') then
    raise exception 'booking_not_cancellable' using errcode = 'P0001';
  end if;
  select booking_cancellation_notice_hours into v_notice from public.businesses where id = a.business_id;
  if a.starts_at - make_interval(hours => v_notice) <= now() then
    raise exception 'cancellation_deadline_passed' using errcode = 'P0001';
  end if;

  update public.appointments
  set status = 'cancelled', cancelled_by = 'customer', cancellation_reason = nullif(btrim(left(p_reason, 500)), '')
  where id = a.id;

  insert into public.notifications (business_id, channel, template, recipient, appointment_id, payload)
  select a.business_id, 'email', 'booking_cancelled_by_client', coalesce(b.email, ''), a.id, jsonb_build_object('audience', 'business')
  from public.businesses b where b.id = a.business_id;
end;
$$;
