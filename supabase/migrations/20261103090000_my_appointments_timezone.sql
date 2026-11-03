-- The app shows a client's visits in the salon's own time zone, so my_appointments
-- also returns it. Same rows and rules as 20261026093000_client_links_review_fixes.sql.
create or replace function public.my_appointments()
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
    'locale', b.locale, 'timezone', b.timezone, 'status', a.status,
    'cancellation_notice_hours', b.booking_cancellation_notice_hours,
    'can_cancel', a.status in ('pending', 'confirmed')
      and a.starts_at - make_interval(hours => b.booking_cancellation_notice_hours) > now()
  )
  from public.client_links l
  join public.appointments a on a.business_id = l.business_id and a.customer_id = l.customer_id
  join public.businesses b on b.id = l.business_id
  left join public.staff_members m on m.id = a.staff_id
  where l.user_id = (select auth.uid()) and a.created_at >= l.linked_at
    and (l.unlinked_at is null or a.created_at < l.unlinked_at)
  order by a.starts_at desc;
$$;
