-- Platform administration with least privilege.
--
-- Platform administrators run the platform; they do not need to read a salon's
-- client records. Direct read access to customers, appointments, appointment
-- history and notifications is therefore removed for platform admins, and the
-- admin dashboard uses aggregate-only SECURITY DEFINER functions instead.

drop policy "customers: authorised read" on public.customers;
create policy "customers: authorised read" on public.customers for select to authenticated
using (public.can_view_customer(business_id, id));

drop policy "appointments: authorised read" on public.appointments;
create policy "appointments: authorised read" on public.appointments for select to authenticated
using (public.can_view_appointment(business_id, staff_id));

drop policy "notifications: settings managers read" on public.notifications;
create policy "notifications: settings managers read" on public.notifications for select to authenticated
using (public.has_business_permission(business_id, 'settings.manage'));

-- Platform-wide usage figures (counts only).
create function public.admin_platform_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'businesses_total', (select count(*) from public.businesses),
    'businesses_active', (select count(*) from public.businesses where status = 'active'),
    'businesses_suspended', (select count(*) from public.businesses where status = 'suspended'),
    'businesses_new_30d', (select count(*) from public.businesses where created_at >= now() - interval '30 days'),
    'booking_pages_live', (select count(*) from public.businesses where booking_enabled and status = 'active'),
    'members_total', (select count(*) from public.business_members where status = 'active'),
    'appointments_30d', (select count(*) from public.appointments where created_at >= now() - interval '30 days'),
    'online_bookings_30d', (select count(*) from public.appointments where source = 'online' and created_at >= now() - interval '30 days'),
    'notifications_skipped_30d', (select count(*) from public.notifications where status = 'skipped' and created_at >= now() - interval '30 days')
  );
end;
$$;

-- Business overview for support: identity, status and usage counts — no client data.
create function public.admin_list_businesses()
returns table (
  id uuid,
  name text,
  slug text,
  business_type public.business_type,
  status public.business_status,
  booking_enabled boolean,
  created_at timestamptz,
  owner_email text,
  member_count bigint,
  staff_count bigint,
  appointments_30d bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  return query
  select
    b.id, b.name, b.slug, b.business_type, b.status, b.booking_enabled, b.created_at,
    (select u.email::text from public.business_members m join auth.users u on u.id = m.user_id
      where m.business_id = b.id and m.role = 'owner' order by m.created_at limit 1),
    (select count(*) from public.business_members m where m.business_id = b.id and m.status = 'active'),
    (select count(*) from public.staff_members s where s.business_id = b.id and s.is_active),
    (select count(*) from public.appointments a where a.business_id = b.id and a.created_at >= now() - interval '30 days')
  from public.businesses b
  order by b.created_at desc;
end;
$$;

revoke execute on function public.admin_platform_stats() from public, anon;
revoke execute on function public.admin_list_businesses() from public, anon;
grant execute on function public.admin_platform_stats() to authenticated;
grant execute on function public.admin_list_businesses() to authenticated;
