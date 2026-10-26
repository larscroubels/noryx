-- Client bookings from the NORYX app: book at a linked salon, see own visits, cancel.
-- A client sees only appointments created since linking; unlinking keeps that history.

create function public.my_appointments()
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
  order by a.starts_at desc;
$$;

create function public.client_book_appointment(
  p_business_id uuid,
  p_service_id uuid,
  p_staff_id uuid,
  p_starts_at timestamptz,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  l public.client_links%rowtype;
  c public.customers%rowtype;
  v_location uuid;
  v_email text;
  v_result jsonb;
begin
  select * into l from public.client_links
  where user_id = v_user and business_id = p_business_id and unlinked_at is null;
  if not found then
    raise exception 'client_link_required' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.appointments a
    join public.client_links cl on cl.business_id = a.business_id and cl.customer_id = a.customer_id
    where cl.user_id = v_user and a.source = 'online' and a.created_at > now() - interval '1 hour'
  ) >= 6 then
    raise exception 'too_many_bookings' using errcode = 'P0001';
  end if;

  select * into c from public.customers where id = l.customer_id and business_id = l.business_id;
  select id into v_location from public.locations
  where business_id = p_business_id and is_active order by sort_order limit 1;
  select lower(email) into v_email from auth.users where id = v_user;

  -- The salon's own rules (window, hours, time off, approval) apply unchanged.
  v_result := public.create_online_booking(
    p_business_id, v_location, p_service_id, p_staff_id, p_starts_at,
    c.first_name, coalesce(c.last_name, ''), coalesce(c.email, v_email), coalesce(c.phone, ''), p_note, false
  );

  -- The visit always belongs to the linked customer record, even if the salon changed its email.
  update public.appointments set customer_id = l.customer_id
  where id = (v_result ->> 'appointment_id')::uuid and customer_id <> l.customer_id;

  return v_result;
end;
$$;

create function public.client_cancel_appointment(p_appointment_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.appointments%rowtype;
  v_notice integer;
begin
  -- Same visibility as my_appointments: own visits created since linking, linked or not.
  select ap.* into a from public.appointments ap
  join public.client_links l on l.business_id = ap.business_id and l.customer_id = ap.customer_id
  where ap.id = p_appointment_id and l.user_id = (select auth.uid()) and ap.created_at >= l.linked_at
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

revoke execute on function public.my_appointments() from public, anon;
revoke execute on function public.client_book_appointment(uuid, uuid, uuid, timestamptz, text) from public, anon;
revoke execute on function public.client_cancel_appointment(uuid, text) from public, anon;
grant execute on function public.my_appointments() to authenticated;
grant execute on function public.client_book_appointment(uuid, uuid, uuid, timestamptz, text) to authenticated;
grant execute on function public.client_cancel_appointment(uuid, text) to authenticated;
