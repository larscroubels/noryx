-- Atomic replacement of weekly schedules. These are SECURITY INVOKER functions:
-- they run with the caller's privileges, so row-level security still decides
-- whether the caller may change the location or staff member.

create function public.set_location_hours(p_location_id uuid, p_hours jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_business_id uuid;
begin
  select business_id into v_business_id from public.locations where id = p_location_id;
  if v_business_id is null or not public.can_manage(v_business_id, 'settings.manage') then
    raise exception 'You do not have permission to change these opening hours' using errcode = '42501';
  end if;

  delete from public.location_hours where location_id = p_location_id;
  insert into public.location_hours (business_id, location_id, weekday, start_minute, end_minute)
  select v_business_id, p_location_id, (h ->> 'weekday')::smallint, (h ->> 'start_minute')::smallint, (h ->> 'end_minute')::smallint
  from jsonb_array_elements(coalesce(p_hours, '[]'::jsonb)) as h;
end;
$$;

create function public.set_staff_working_hours(p_staff_id uuid, p_hours jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_business_id uuid;
begin
  select business_id into v_business_id from public.staff_members where id = p_staff_id;
  if v_business_id is null or not (
    public.can_manage(v_business_id, 'staff.manage')
    or (public.can_manage(v_business_id, 'schedule.manage_own') and public.is_own_staff(p_staff_id))
  ) then
    raise exception 'You do not have permission to change this schedule' using errcode = '42501';
  end if;

  delete from public.staff_working_hours where staff_id = p_staff_id;
  insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute)
  select v_business_id, p_staff_id, (h ->> 'weekday')::smallint, (h ->> 'start_minute')::smallint, (h ->> 'end_minute')::smallint
  from jsonb_array_elements(coalesce(p_hours, '[]'::jsonb)) as h;
end;
$$;

revoke execute on function public.set_location_hours(uuid, jsonb) from public, anon;
revoke execute on function public.set_staff_working_hours(uuid, jsonb) from public, anon;
grant execute on function public.set_location_hours(uuid, jsonb) to authenticated;
grant execute on function public.set_staff_working_hours(uuid, jsonb) to authenticated;
