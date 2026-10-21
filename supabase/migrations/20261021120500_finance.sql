-- Finance basics: recorded payments and expenses.
--
-- NORYX does not process payments yet. A payment row is a record entered by the
-- salon ("paid by card at the desk"), never a claim that money moved through
-- NORYX. Refunds keep the original record and are marked, not deleted.
-- Booked appointment prices remain estimates and are reported separately.

alter table public.appointments add constraint appointments_business_id_id_key unique (business_id, id);

create type public.payment_method as enum ('cash', 'card', 'bancontact', 'bank_transfer', 'voucher', 'other');
create type public.payment_status as enum ('recorded', 'refunded');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  appointment_id uuid,
  customer_id uuid,
  amount_cents integer not null check (amount_cents between 1 and 10000000),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  method public.payment_method not null,
  status public.payment_status not null default 'recorded',
  paid_at timestamptz not null default now(),
  note text check (note is null or char_length(note) <= 300),
  recorded_by uuid references auth.users (id) on delete set null,
  refunded_at timestamptz,
  refunded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((status = 'refunded') = (refunded_at is not null)),
  foreign key (business_id, appointment_id)
    references public.appointments (business_id, id) on delete set null (appointment_id),
  foreign key (business_id, customer_id)
    references public.customers (business_id, id) on delete set null (customer_id)
);

create index payments_business_paid_idx on public.payments (business_id, paid_at desc);
create index payments_appointment_idx on public.payments (appointment_id);

create type public.expense_category as enum (
  'products', 'rent', 'utilities', 'salaries', 'marketing', 'equipment', 'software', 'training', 'other'
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category public.expense_category not null default 'other',
  description text not null check (char_length(btrim(description)) between 1 and 200),
  amount_cents integer not null check (amount_cents between 1 and 100000000),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  spent_on date not null,
  supplier text check (supplier is null or char_length(supplier) <= 120),
  reference text check (reference is null or char_length(reference) <= 80),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_business_date_idx on public.expenses (business_id, spent_on desc);

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

alter table public.payments enable row level security;
alter table public.expenses enable row level security;

-- Figures are visible only with finance.view (owners by default).
create policy "payments: finance readers" on public.payments for select to authenticated
using (public.has_business_permission(business_id, 'finance.view'));

-- Recording a payment at checkout is allowed for finance managers and for
-- people who manage appointments (front desk) — they still cannot see totals.
create policy "payments: record" on public.payments for insert to authenticated
with check (
  status = 'recorded'
  and recorded_by = (select auth.uid())
  and (public.can_manage(business_id, 'finance.manage') or public.can_manage(business_id, 'appointments.manage_all'))
);

create policy "payments: finance managers refund" on public.payments for update to authenticated
using (public.can_manage(business_id, 'finance.manage'))
with check (public.can_manage(business_id, 'finance.manage'));

create policy "expenses: finance readers" on public.expenses for select to authenticated
using (public.has_business_permission(business_id, 'finance.view'));
create policy "expenses: finance managers write" on public.expenses for all to authenticated
using (public.can_manage(business_id, 'finance.manage'))
with check (public.can_manage(business_id, 'finance.manage'));

revoke all on table public.payments, public.expenses from anon, authenticated;
grant select, insert on public.payments to authenticated;
-- Only the refund columns can change; amounts and dates are immutable records.
grant update (status, refunded_at, refunded_by) on public.payments to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
