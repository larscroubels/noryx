-- Client self-service for online bookings.
--
-- Each online booking gets a private management link. The token is 192 random
-- bits, shown to the client once (and later sent by email); only its SHA-256
-- hash is stored. The cancellation deadline is enforced here, not in the UI.

alter table public.appointments add column manage_token_hash text unique;

-- Issues (or re-issues) the management token. NORYX server only.
create function public.issue_booking_token(p_appointment_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  update public.appointments
  set manage_token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex')
  where id = p_appointment_id and source = 'online';
  if not found then
    raise exception 'appointment_not_found' using errcode = 'P0002';
  end if;
  return v_token;
end;
$$;

-- What the client may see about their own booking.
create function public.get_booking_by_token(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business_name', b.name,
    'business_slug', b.slug,
    'business_phone', b.phone,
    'timezone', b.timezone,
    'currency', a.currency,
    'locale', b.locale,
    'service_name', a.service_name,
    'staff_name', s.display_name,
    'starts_at', a.starts_at,
    'ends_at', a.ends_at,
    'price_cents', a.price_cents,
    'status', a.status,
    'cancellation_notice_hours', b.booking_cancellation_notice_hours,
    'can_cancel', a.status in ('pending', 'confirmed')
      and a.starts_at - make_interval(hours => b.booking_cancellation_notice_hours) > now()
  )
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  join public.staff_members s on s.id = a.staff_id
  where a.manage_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create function public.cancel_booking_by_token(p_token text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.appointments%rowtype;
  v_notice integer;
begin
  select * into a from public.appointments
  where manage_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;
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

revoke execute on function public.issue_booking_token(uuid) from public, anon, authenticated;
revoke execute on function public.get_booking_by_token(text) from public;
revoke execute on function public.cancel_booking_by_token(text, text) from public;
grant execute on function public.issue_booking_token(uuid) to service_role;
grant execute on function public.get_booking_by_token(text) to anon, authenticated;
grant execute on function public.cancel_booking_by_token(text, text) to anon, authenticated;
