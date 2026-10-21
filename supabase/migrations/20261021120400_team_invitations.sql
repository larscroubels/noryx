-- Team invitations and member management.
--
-- Rules enforced here (not only in the app):
--   * Only members with members.manage can invite, change or remove members.
--   * Only owners can invite owners, change an owner or make someone an owner.
--   * Nobody can change their own membership (no self-escalation).
--   * Non-owners can only grant permissions they hold themselves.
--   * Invitation tokens are stored as SHA-256 hashes, expire after 7 days and
--     can only be accepted by a signed-in user with the invited email address.

create extension if not exists pgcrypto with schema extensions;

create table public.business_invitations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role public.member_role not null default 'staff',
  staff_id uuid,
  token_hash text not null unique,
  invited_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (business_id, staff_id) references public.staff_members (business_id, id) on delete set null (staff_id)
);

create index business_invitations_business_idx on public.business_invitations (business_id, created_at desc);
create unique index business_invitations_open_email_key
  on public.business_invitations (business_id, lower(email))
  where accepted_at is null and revoked_at is null;

alter table public.business_invitations enable row level security;

create policy "business_invitations: member managers read" on public.business_invitations for select to authenticated
using (public.has_business_permission(business_id, 'members.manage'));

revoke all on table public.business_invitations from anon, authenticated;
grant select on public.business_invitations to authenticated;

-- Returns the caller's role in a business (null when not an active member).
create function public.my_business_role(p_business_id uuid)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.business_members
  where business_id = p_business_id and user_id = (select auth.uid()) and status = 'active';
$$;

-- Creates an invitation and returns the plain token (shown once, never stored).
create function public.create_invitation(
  p_business_id uuid,
  p_email text,
  p_role public.member_role,
  p_staff_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
  v_email text := lower(btrim(p_email));
begin
  if not public.can_manage(p_business_id, 'members.manage') then
    raise exception 'You do not have permission to invite team members' using errcode = '42501';
  end if;
  if p_role = 'owner' and public.my_business_role(p_business_id) <> 'owner' then
    raise exception 'Only owners can invite another owner' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.business_members m join auth.users u on u.id = m.user_id
    where m.business_id = p_business_id and lower(u.email) = v_email
  ) then
    raise exception 'already_member' using errcode = 'P0001';
  end if;
  if p_staff_id is not null and exists (
    select 1 from public.staff_members where id = p_staff_id and business_id = p_business_id and user_id is not null
  ) then
    raise exception 'staff_already_linked' using errcode = 'P0001';
  end if;

  -- Replace any open invitation for the same address.
  update public.business_invitations set revoked_at = now()
  where business_id = p_business_id and lower(email) = v_email and accepted_at is null and revoked_at is null;

  insert into public.business_invitations (business_id, email, role, staff_id, token_hash, invited_by)
  values (p_business_id, v_email, p_role, p_staff_id, encode(extensions.digest(v_token, 'sha256'), 'hex'), (select auth.uid()));

  perform public.log_audit_event(p_business_id, 'member.invited', 'invitation', v_email, jsonb_build_object('role', p_role));
  return v_token;
end;
$$;

-- Public details of an invitation, so the invitee can see what they're joining.
create function public.get_invitation(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business_name', b.name,
    'email', i.email,
    'role', i.role,
    'expired', i.expires_at < now(),
    'used', i.accepted_at is not null or i.revoked_at is not null
  )
  from public.business_invitations i
  join public.businesses b on b.id = i.business_id
  where i.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_email text;
  inv public.business_invitations%rowtype;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select lower(email) into v_email from auth.users where id = v_user;

  select * into inv from public.business_invitations
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;

  if not found or inv.revoked_at is not null or inv.accepted_at is not null then
    raise exception 'invitation_invalid' using errcode = 'P0001';
  end if;
  if inv.expires_at < now() then
    raise exception 'invitation_expired' using errcode = 'P0001';
  end if;
  if inv.email <> v_email then
    raise exception 'invitation_email_mismatch' using errcode = 'P0001';
  end if;

  insert into public.business_members (business_id, user_id, role)
  values (inv.business_id, v_user, inv.role)
  on conflict (business_id, user_id) do update set status = 'active';

  if inv.staff_id is not null then
    update public.staff_members set user_id = v_user
    where id = inv.staff_id and business_id = inv.business_id and user_id is null;
  end if;

  update public.business_invitations set accepted_at = now(), accepted_by = v_user where id = inv.id;
  perform public.log_audit_event(inv.business_id, 'member.joined', 'member', v_user::text, jsonb_build_object('role', inv.role));
  return inv.business_id;
end;
$$;

create function public.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid;
begin
  select business_id into v_business from public.business_invitations where id = p_invitation_id;
  if v_business is null or not public.can_manage(v_business, 'members.manage') then
    raise exception 'You do not have permission to revoke this invitation' using errcode = '42501';
  end if;
  update public.business_invitations set revoked_at = now() where id = p_invitation_id and accepted_at is null;
end;
$$;

create function public.update_member(
  p_member_id uuid,
  p_role public.member_role,
  p_granted text[] default '{}',
  p_revoked text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  m public.business_members%rowtype;
  v_caller_role public.member_role;
begin
  select * into m from public.business_members where id = p_member_id for update;
  if not found or not public.can_manage(m.business_id, 'members.manage') then
    raise exception 'You do not have permission to change this member' using errcode = '42501';
  end if;
  if m.user_id = (select auth.uid()) then
    raise exception 'You cannot change your own role or permissions' using errcode = '42501';
  end if;
  v_caller_role := public.my_business_role(m.business_id);
  if (m.role = 'owner' or p_role = 'owner') and v_caller_role <> 'owner' then
    raise exception 'Only owners can change owners' using errcode = '42501';
  end if;
  if v_caller_role <> 'owner' and exists (
    select 1 from unnest(coalesce(p_granted, '{}')) as g (key)
    where not public.has_business_permission(m.business_id, g.key)
  ) then
    raise exception 'You can only grant permissions you have yourself' using errcode = '42501';
  end if;

  update public.business_members
  set role = p_role, granted_permissions = coalesce(p_granted, '{}'), revoked_permissions = coalesce(p_revoked, '{}')
  where id = p_member_id;

  perform public.log_audit_event(m.business_id, 'member.updated', 'member', m.user_id::text,
    jsonb_build_object('role', p_role, 'granted', p_granted, 'revoked', p_revoked));
end;
$$;

create function public.remove_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  m public.business_members%rowtype;
begin
  select * into m from public.business_members where id = p_member_id for update;
  if not found or not public.can_manage(m.business_id, 'members.manage') then
    raise exception 'You do not have permission to remove this member' using errcode = '42501';
  end if;
  if m.user_id = (select auth.uid()) then
    raise exception 'You cannot remove yourself' using errcode = '42501';
  end if;
  if m.role = 'owner' and public.my_business_role(m.business_id) <> 'owner' then
    raise exception 'Only owners can remove owners' using errcode = '42501';
  end if;

  -- Unlink the login from the staff profile; the profile and its history stay.
  update public.staff_members set user_id = null where business_id = m.business_id and user_id = m.user_id;
  delete from public.business_members where id = p_member_id;
  perform public.log_audit_event(m.business_id, 'member.removed', 'member', m.user_id::text, '{}'::jsonb);
end;
$$;

-- Team list with names and emails, for people who manage members.
create function public.list_business_members(p_business_id uuid)
returns table (
  id uuid,
  user_id uuid,
  role public.member_role,
  status public.member_status,
  granted_permissions text[],
  revoked_permissions text[],
  full_name text,
  email text,
  staff_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_business_permission(p_business_id, 'members.manage') then
    raise exception 'You do not have permission to view team members' using errcode = '42501';
  end if;
  return query
  select m.id, m.user_id, m.role, m.status, m.granted_permissions, m.revoked_permissions,
         p.full_name, u.email::text,
         (select s.id from public.staff_members s where s.business_id = m.business_id and s.user_id = m.user_id),
         m.created_at
  from public.business_members m
  join auth.users u on u.id = m.user_id
  left join public.profiles p on p.id = m.user_id
  where m.business_id = p_business_id
  order by m.role, m.created_at;
end;
$$;

revoke execute on function public.create_invitation(uuid, text, public.member_role, uuid) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
revoke execute on function public.revoke_invitation(uuid) from public, anon;
revoke execute on function public.update_member(uuid, public.member_role, text[], text[]) from public, anon;
revoke execute on function public.remove_member(uuid) from public, anon;
revoke execute on function public.list_business_members(uuid) from public, anon;
revoke execute on function public.get_invitation(text) from public;
grant execute on function public.create_invitation(uuid, text, public.member_role, uuid) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.revoke_invitation(uuid) to authenticated;
grant execute on function public.update_member(uuid, public.member_role, text[], text[]) to authenticated;
grant execute on function public.remove_member(uuid) to authenticated;
grant execute on function public.list_business_members(uuid) to authenticated;
grant execute on function public.get_invitation(text) to anon, authenticated;
