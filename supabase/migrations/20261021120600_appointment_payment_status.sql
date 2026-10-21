-- Lets anyone who can see an appointment know whether it has been paid, without
-- giving them access to the business's payment records or totals.
create function public.appointment_paid_cents(p_appointment_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(p.amount_cents), 0)::integer
  from public.payments p
  join public.appointments a on a.id = p.appointment_id
  where p.appointment_id = p_appointment_id
    and p.status = 'recorded'
    and public.can_view_appointment(a.business_id, a.staff_id);
$$;

revoke execute on function public.appointment_paid_cents(uuid) from public, anon;
grant execute on function public.appointment_paid_cents(uuid) to authenticated;
