-- Moving an appointment, shared by the web workspace and the NORYX app. Runs as the
-- caller: RLS decides who may move which appointment (and to whom), the status trigger
-- refuses cancelled ones and the exclusion constraint refuses overlaps (23P01). The
-- buffer after the appointment is kept as it was booked.
create function public.reschedule_appointment(
  p_appointment_id uuid,
  p_staff_id uuid,
  p_starts_at timestamptz
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.appointments a
  set staff_id = p_staff_id,
      starts_at = p_starts_at,
      ends_at = p_starts_at + make_interval(mins => a.duration_minutes),
      blocked_until = p_starts_at + make_interval(mins => a.duration_minutes) + (a.blocked_until - a.ends_at)
  where a.id = p_appointment_id;
  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'appointment_not_found' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.reschedule_appointment(uuid, uuid, timestamptz) from public, anon;
grant execute on function public.reschedule_appointment(uuid, uuid, timestamptz) to authenticated;
