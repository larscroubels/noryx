-- Deleting appointments for good, by the salon or by the client.
--
-- Cancelling keeps the appointment (status "cancelled") for history and
-- statistics. Deleting removes it everywhere: the appointment row, its history
-- (appointment_events, cascade), its notification outbox rows and its private
-- client link. Financial records are kept but unlinked (payments and gift-card
-- transactions use ON DELETE SET NULL), so bookkeeping stays complete.
-- The audit log keeps only that an appointment was deleted, by whom, and when —
-- no client details.

-- Salon side: same rights as managing the appointment.
create function public.delete_appointment(p_appointment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.appointments%rowtype;
begin
  select * into a from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'Appointment not found' using errcode = '22023';
  end if;
  if not (
    public.has_business_permission(a.business_id, 'appointments.manage_all')
    or (
      public.has_business_permission(a.business_id, 'appointments.manage_own')
      and a.staff_id = public.own_staff_id(a.business_id)
    )
  ) then
    raise exception 'You do not have permission to delete this appointment' using errcode = '42501';
  end if;
  delete from public.notifications where appointment_id = a.id;
  delete from public.appointments where id = a.id;
  perform public.log_audit_event(a.business_id, 'appointment.deleted', 'appointment', a.id::text,
    jsonb_build_object('by', 'business'));
end;
$$;

-- Client side: through the private booking link, until the salon's cancellation deadline.
-- The salon still gets an outbox notice that the time is free again (time and service only).
create function public.delete_booking_by_token(p_token text)
returns uuid
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

  delete from public.notifications where appointment_id = a.id;
  delete from public.appointments where id = a.id;

  insert into public.notifications (business_id, channel, template, recipient, payload)
  select a.business_id, 'email', 'booking_deleted_by_client', coalesce(b.email, ''),
    jsonb_build_object('audience', 'business', 'deleted_appointment_id', a.id,
      'starts_at', a.starts_at, 'service_name', a.service_name)
  from public.businesses b where b.id = a.business_id;

  perform public.log_audit_event(a.business_id, 'appointment.deleted', 'appointment', a.id::text,
    jsonb_build_object('by', 'client'));
  return a.id;
end;
$$;

revoke execute on function public.delete_appointment(uuid) from public, anon;
grant execute on function public.delete_appointment(uuid) to authenticated;
revoke execute on function public.delete_booking_by_token(text) from public;
grant execute on function public.delete_booking_by_token(text) to anon, authenticated;
