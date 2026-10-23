-- Support requests: questions sent to the NORYX team through the contact form on /help.
--
-- Platform-level data, not tied to a salon (like platform_admins), so there is no
-- business_id. Anyone can submit through submit_support_request(); only platform
-- administrators can read, close or delete requests. Nothing is emailed: the team
-- reads them in /admin and replies to the given address.

create type public.support_request_topic as enum ('question', 'account', 'billing', 'problem', 'other');
create type public.support_request_status as enum ('open', 'closed');

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic public.support_request_topic not null,
  message text not null check (char_length(message) between 10 and 4000),
  locale text not null default 'nl' check (locale in ('nl', 'fr', 'en')),
  user_id uuid references auth.users (id) on delete set null,
  status public.support_request_status not null default 'open',
  closed_by uuid references auth.users (id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index support_requests_status_created_idx on public.support_requests (status, created_at desc);
create index support_requests_email_created_idx on public.support_requests (lower(email), created_at desc);

alter table public.support_requests enable row level security;

create policy "support_requests: platform admins read"
on public.support_requests for select to authenticated
using (public.is_platform_admin());

create function public.submit_support_request(
  p_name text,
  p_email text,
  p_topic public.support_request_topic,
  p_message text,
  p_locale text default 'nl'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_email text := lower(btrim(p_email));
begin
  -- A flood guard that also holds across server instances; the app limits per visitor too.
  if (
    select count(*) from public.support_requests
    where lower(email) = v_email and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'support_rate_limited' using errcode = 'P0001';
  end if;
  insert into public.support_requests (name, email, topic, message, locale, user_id)
  values (btrim(p_name), v_email, p_topic, btrim(p_message), coalesce(p_locale, 'nl'), (select auth.uid()))
  returning id into v_id;
  return v_id;
end;
$$;

create function public.admin_set_support_request_status(
  p_request_id uuid,
  p_status public.support_request_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator rights required' using errcode = '42501';
  end if;
  update public.support_requests
  set status = p_status,
      closed_by = case when p_status = 'closed' then (select auth.uid()) end,
      closed_at = case when p_status = 'closed' then now() end
  where id = p_request_id;
  if not found then
    raise exception 'Support request not found' using errcode = '22023';
  end if;
  perform public.log_audit_event(null, 'support_request.' || p_status::text, 'support_request', p_request_id::text);
end;
$$;

-- Erasure on request (GDPR): removes the message and the sender's details.
create function public.admin_delete_support_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator rights required' using errcode = '42501';
  end if;
  delete from public.support_requests where id = p_request_id;
  if found then
    perform public.log_audit_event(null, 'support_request.deleted', 'support_request', p_request_id::text);
  end if;
end;
$$;

revoke all on table public.support_requests from anon, authenticated;
grant select on public.support_requests to authenticated;

revoke execute on function public.submit_support_request(text, text, public.support_request_topic, text, text) from public;
revoke execute on function public.admin_set_support_request_status(uuid, public.support_request_status) from public, anon;
revoke execute on function public.admin_delete_support_request(uuid) from public, anon;
grant execute on function public.submit_support_request(text, text, public.support_request_topic, text, text) to anon, authenticated;
grant execute on function public.admin_set_support_request_status(uuid, public.support_request_status) to authenticated;
grant execute on function public.admin_delete_support_request(uuid) to authenticated;
