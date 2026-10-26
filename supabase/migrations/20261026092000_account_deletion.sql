-- Account deletion, step one (run as the user): refuse while they are a salon's only
-- owner, then detach their client records so the salon keeps its history.
-- The server then deletes the auth user with the service role.
create function public.prepare_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.business_members m
    where m.user_id = v_user and m.role = 'owner' and m.status = 'active'
      and not exists (
        select 1 from public.business_members o
        where o.business_id = m.business_id and o.user_id <> v_user and o.role = 'owner' and o.status = 'active'
      )
  ) then
    raise exception 'account_owns_business' using errcode = 'P0001';
  end if;

  update public.customers set user_id = null where user_id = v_user;
  delete from public.client_links where user_id = v_user;
  delete from public.business_members where user_id = v_user;
end;
$$;

revoke execute on function public.prepare_account_deletion() from public, anon;
grant execute on function public.prepare_account_deletion() to authenticated;
