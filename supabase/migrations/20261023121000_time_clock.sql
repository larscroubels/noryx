-- Time clock: professionals clock in and out; managers see and correct the team's hours.
--
-- Part of Pro and Ultra (feature "time_clock"). Writes only go through the
-- functions below:
--   clock_in() / clock_out()      — the signed-in member's own linked staff profile
--                                   (needs schedule.manage_own);
--   save_time_entry() / delete_time_entry() — corrections by members with staff.manage,
--                                   recorded in the audit log.
-- One open entry per professional, no overlapping entries.

update public.plans set features = array_append(features, 'time_clock') where id in ('pro', 'ultra');

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  staff_id uuid not null,
  clock_in timestamptz not null,
  clock_out timestamptz,
  note text check (note is null or char_length(note) <= 300),
  created_by uuid references auth.users (id) on delete set null,
  edited_by uuid references auth.users (id) on delete set null,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (business_id, staff_id) references public.staff_members (business_id, id) on delete cascade,
  check (clock_out is null or clock_out > clock_in),
  constraint time_entries_no_overlap exclude using gist (
    staff_id with =,
    tstzrange(clock_in, coalesce(clock_out, 'infinity'::timestamptz)) with &&
  )
);

create unique index time_entries_one_open_per_staff on public.time_entries (staff_id) where clock_out is null;
create index time_entries_business_clock_in on public.time_entries (business_id, clock_in desc);

alter table public.time_entries enable row level security;

-- The active staff profile linked to the signed-in member, if any.
create function public.own_staff_id(p_business_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id from public.staff_members s
  where s.business_id = p_business_id and s.user_id = (select auth.uid()) and s.is_active
  order by s.created_at
  limit 1;
$$;

create policy "time_entries: own entries or staff managers" on public.time_entries for select to authenticated
using (
  public.is_business_member(business_id)
  and (staff_id = public.own_staff_id(business_id) or public.has_business_permission(business_id, 'staff.manage'))
);

create function public.require_time_clock(p_business_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.business_has_feature(p_business_id, 'time_clock') then
    raise exception 'plan_feature_time_clock' using errcode = 'P0001';
  end if;
end;
$$;

create function public.clock_in(p_business_id uuid)
returns public.time_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_staff uuid := public.own_staff_id(p_business_id);
  v_entry public.time_entries;
begin
  if v_staff is null or not public.has_business_permission(p_business_id, 'schedule.manage_own') then
    raise exception 'You need a linked staff profile to use the time clock' using errcode = '42501';
  end if;
  perform public.require_time_clock(p_business_id);
  if exists (select 1 from public.time_entries where staff_id = v_staff and clock_out is null) then
    raise exception 'already_clocked_in' using errcode = 'P0001';
  end if;
  insert into public.time_entries (business_id, staff_id, clock_in, created_by)
  values (p_business_id, v_staff, date_trunc('minute', now()), (select auth.uid()))
  returning * into v_entry;
  return v_entry;
end;
$$;

create function public.clock_out(p_business_id uuid)
returns public.time_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_staff uuid := public.own_staff_id(p_business_id);
  v_entry public.time_entries;
begin
  if v_staff is null or not public.has_business_permission(p_business_id, 'schedule.manage_own') then
    raise exception 'You need a linked staff profile to use the time clock' using errcode = '42501';
  end if;
  perform public.require_time_clock(p_business_id);
  update public.time_entries
  set clock_out = greatest(date_trunc('minute', now()), clock_in + interval '1 minute')
  where staff_id = v_staff and clock_out is null
  returning * into v_entry;
  if not found then
    raise exception 'not_clocked_in' using errcode = 'P0001';
  end if;
  return v_entry;
end;
$$;

-- Managers add or correct an entry (p_entry_id null = new entry; p_clock_out null = still working).
create function public.save_time_entry(
  p_business_id uuid,
  p_staff_id uuid,
  p_clock_in timestamptz,
  p_clock_out timestamptz default null,
  p_note text default null,
  p_entry_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := p_entry_id;
begin
  if not public.has_business_permission(p_business_id, 'staff.manage') then
    raise exception 'You do not have permission to change time entries' using errcode = '42501';
  end if;
  perform public.require_time_clock(p_business_id);
  if not exists (select 1 from public.staff_members where id = p_staff_id and business_id = p_business_id) then
    raise exception 'Invalid professional' using errcode = '22023';
  end if;
  if v_id is null then
    insert into public.time_entries (business_id, staff_id, clock_in, clock_out, note, created_by, edited_by, edited_at)
    values (p_business_id, p_staff_id, p_clock_in, p_clock_out, nullif(btrim(p_note), ''), (select auth.uid()), (select auth.uid()), now())
    returning id into v_id;
  else
    update public.time_entries
    set staff_id = p_staff_id, clock_in = p_clock_in, clock_out = p_clock_out, note = nullif(btrim(p_note), ''),
        edited_by = (select auth.uid()), edited_at = now()
    where id = v_id and business_id = p_business_id;
    if not found then
      raise exception 'Time entry not found' using errcode = '22023';
    end if;
  end if;
  perform public.log_audit_event(p_business_id, 'time_entry.saved', 'time_entry', v_id::text,
    jsonb_build_object('staff_id', p_staff_id, 'clock_in', p_clock_in, 'clock_out', p_clock_out));
  return v_id;
end;
$$;

create function public.delete_time_entry(p_business_id uuid, p_entry_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.time_entries;
begin
  if not public.has_business_permission(p_business_id, 'staff.manage') then
    raise exception 'You do not have permission to change time entries' using errcode = '42501';
  end if;
  delete from public.time_entries where id = p_entry_id and business_id = p_business_id returning * into v_entry;
  if found then
    perform public.log_audit_event(p_business_id, 'time_entry.deleted', 'time_entry', p_entry_id::text,
      jsonb_build_object('staff_id', v_entry.staff_id, 'clock_in', v_entry.clock_in, 'clock_out', v_entry.clock_out));
  end if;
end;
$$;

revoke all on table public.time_entries from anon, authenticated;
grant select on public.time_entries to authenticated;

revoke execute on function public.own_staff_id(uuid) from public, anon;
revoke execute on function public.require_time_clock(uuid) from public, anon, authenticated;
revoke execute on function public.clock_in(uuid) from public, anon;
revoke execute on function public.clock_out(uuid) from public, anon;
revoke execute on function public.save_time_entry(uuid, uuid, timestamptz, timestamptz, text, uuid) from public, anon;
revoke execute on function public.delete_time_entry(uuid, uuid) from public, anon;
grant execute on function public.own_staff_id(uuid) to authenticated;
grant execute on function public.clock_in(uuid) to authenticated;
grant execute on function public.clock_out(uuid) to authenticated;
grant execute on function public.save_time_entry(uuid, uuid, timestamptz, timestamptz, text, uuid) to authenticated;
grant execute on function public.delete_time_entry(uuid, uuid) to authenticated;
