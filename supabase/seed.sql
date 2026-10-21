-- ════════════════════════════════════════════════════════════════════════════
-- LOCAL DEVELOPMENT DEMO DATA — never run against a production database.
--
-- Loaded by `supabase db reset`. Creates a fictional salon ("Atelier Noor") with
-- demo logins so the workspace, calendar and booking page can be explored:
--
--   owner@noryx.test   NoryxDemo2026   salon owner (full access)
--   staff@noryx.test   NoryxDemo2026   staff member (own calendar only)
--   admin@noryx.test   NoryxDemo2026   NORYX platform administrator
--
-- Public booking page: http://localhost:3000/atelier-noor
-- Appointments are generated relative to today, in Europe/Brussels time.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare
  v_owner uuid := '11111111-1111-4111-8111-111111111111';
  v_staff_user uuid := '22222222-2222-4222-8222-222222222222';
  v_admin uuid := '33333333-3333-4333-8333-333333333333';
  v_business uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  v_location uuid;
  v_cat_cuts uuid;
  v_cat_colour uuid;
  v_cat_care uuid;
  v_svc_cut uuid;
  v_svc_mens uuid;
  v_svc_balayage uuid;
  v_svc_colour uuid;
  v_svc_treatment uuid;
  v_lena uuid;
  v_amir uuid;
  v_julie uuid;
  v_customers uuid[] := '{}';
  v_customer uuid;
  v_today date := (now() at time zone 'Europe/Brussels')::date;
  v_day date;
  v_staff uuid;
  v_service record;
  v_start timestamptz;
  v_status public.appointment_status;
  v_minute integer;
  i integer;
  d integer;
begin
  -- Demo logins (password: NoryxDemo2026)
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
         extensions.crypt('NoryxDemo2026', extensions.gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', u.full_name),
         now(), now(), '', '', '', ''
  from (values
    (v_owner, 'owner@noryx.test', 'Lena Peeters'),
    (v_staff_user, 'staff@noryx.test', 'Amir Haddad'),
    (v_admin, 'admin@noryx.test', 'NORYX Admin')
  ) as u (id, email, full_name);

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id, u.id::text,
         jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
  from auth.users u where u.id in (v_owner, v_staff_user, v_admin);

  insert into public.platform_admins (user_id, note) values (v_admin, 'Lokale demobeheerder');

  -- Business, membership and location
  insert into public.businesses (
    id, slug, name, business_type, description, email, phone, website_url, instagram_handle,
    created_by, onboarding_completed_at, booking_enabled, booking_min_notice_minutes, booking_buffer_minutes
  ) values (
    v_business, 'atelier-noor', 'Atelier Noor', 'hair_salon',
    'Een rustige, lichte salon in hartje Gent, gespecialiseerd in natuurlijke kleuren en precisieknippen.',
    'hello@ateliernoor.test', '+32 9 123 45 67', 'https://ateliernoor.test', 'ateliernoor',
    v_owner, now(), true, 60, 0
  );

  insert into public.business_members (business_id, user_id, role) values
    (v_business, v_owner, 'owner'),
    (v_business, v_staff_user, 'staff');

  insert into public.locations (business_id, name, address_line1, postal_code, city, phone)
  values (v_business, 'Atelier Noor', 'Veldstraat 21', '9000', 'Gent', '+32 9 123 45 67')
  returning id into v_location;

  -- Tuesday–Friday 09:00–18:00, Saturday 09:00–16:00
  insert into public.location_hours (business_id, location_id, weekday, start_minute, end_minute)
  select v_business, v_location, w, 540, case when w = 6 then 960 else 1080 end from generate_series(2, 6) as w;

  -- Services
  insert into public.service_categories (business_id, name, sort_order) values (v_business, 'Knippen & styling', 0) returning id into v_cat_cuts;
  insert into public.service_categories (business_id, name, sort_order) values (v_business, 'Kleuren', 1) returning id into v_cat_colour;
  insert into public.service_categories (business_id, name, sort_order) values (v_business, 'Verzorging', 2) returning id into v_cat_care;

  insert into public.services (business_id, category_id, name, description, duration_minutes, price_cents, sort_order)
  values (v_business, v_cat_cuts, 'Knippen & brushen dames', 'Advies, wassen, precisieknippen en brushen.', 60, 5800, 0) returning id into v_svc_cut;
  insert into public.services (business_id, category_id, name, description, duration_minutes, price_cents, sort_order)
  values (v_business, v_cat_cuts, 'Knippen heren', 'Wassen, knippen en stylen.', 30, 3400, 1) returning id into v_svc_mens;
  insert into public.services (business_id, category_id, name, description, duration_minutes, price_cents, buffer_after_minutes, sort_order)
  values (v_business, v_cat_colour, 'Balayage', 'Met de hand geschilderde, zonnige kleur, inclusief toner en brushen.', 150, 16500, 15, 0) returning id into v_svc_balayage;
  insert into public.services (business_id, category_id, name, description, duration_minutes, price_cents, promo_price_cents, sort_order)
  values (v_business, v_cat_colour, 'Uitgroei kleuren', 'Uitgroei bijkleuren met brushen.', 90, 7900, 6900, 1) returning id into v_svc_colour;
  insert into public.services (business_id, category_id, name, description, duration_minutes, price_cents, sort_order)
  values (v_business, v_cat_care, 'Herstelbehandeling', 'Intensief herstelritueel met hoofdhuidmassage.', 45, 4200, 0) returning id into v_svc_treatment;

  -- Staff
  insert into public.staff_members (business_id, location_id, user_id, display_name, job_title, bio, sort_order)
  values (v_business, v_location, v_owner, 'Lena Peeters', 'Eigenaar & kleurspecialist', 'Vijftien jaar ervaring met kleuren, met een voorliefde voor zachte, natuurlijke resultaten.', 0)
  returning id into v_lena;
  insert into public.staff_members (business_id, location_id, user_id, display_name, job_title, bio, sort_order)
  values (v_business, v_location, v_staff_user, 'Amir Haddad', 'Stylist', 'Precisieknippen en moeiteloze styling.', 1)
  returning id into v_amir;
  insert into public.staff_members (business_id, location_id, display_name, job_title, sort_order)
  values (v_business, v_location, 'Julie Maes', 'Junior stylist', 2)
  returning id into v_julie;

  insert into public.staff_services (business_id, staff_id, service_id, price_cents) values
    (v_business, v_lena, v_svc_cut, 6200), (v_business, v_lena, v_svc_balayage, null), (v_business, v_lena, v_svc_colour, null),
    (v_business, v_lena, v_svc_treatment, null),
    (v_business, v_amir, v_svc_cut, null), (v_business, v_amir, v_svc_mens, null), (v_business, v_amir, v_svc_treatment, null),
    (v_business, v_julie, v_svc_mens, 2900), (v_business, v_julie, v_svc_cut, 4800), (v_business, v_julie, v_svc_treatment, null);

  -- Lena: Tue–Fri with a lunch break; Amir: Wed–Sat; Julie: part-time Thu–Sat mornings
  insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute)
  select v_business, v_lena, w, r.s, r.e from generate_series(2, 5) w, (values (540, 750), (810, 1080)) r (s, e);
  insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute)
  select v_business, v_amir, w, 540, case when w = 6 then 960 else 1080 end from generate_series(3, 6) w;
  insert into public.staff_working_hours (business_id, staff_id, weekday, start_minute, end_minute)
  select v_business, v_julie, w, 540, 780 from generate_series(4, 6) w;

  insert into public.staff_time_off (business_id, staff_id, starts_at, ends_at, kind, note)
  values (v_business, v_julie, ((v_today + 14)::timestamp) at time zone 'Europe/Brussels', ((v_today + 21)::timestamp) at time zone 'Europe/Brussels', 'holiday', 'Zomervakantie');

  -- Customers
  for i in 1..18 loop
    insert into public.customers (business_id, first_name, last_name, email, phone, source, marketing_opt_in, created_at)
    values (
      v_business,
      (array['Sofie','Lucas','Emma','Nora','Louis','Marie','Elise','Arthur','Charlotte','Jules','Lotte','Noah','Fien','Victor','Hanne','Mila','Bram','Ines'])[i],
      (array['Janssens','Dubois','Willems','Claes','Wouters','Goossens','De Smet','Mertens','Jacobs','Martens','Peeters','Lambert','Vermeulen','Hermans','Pauwels','Desmet','Coppens','Leclercq'])[i],
      'client' || i || '@example.test',
      '+32 470 ' || lpad((100000 + i * 7919)::text, 6, '0'),
      case when i % 3 = 0 then 'manual' else 'online_booking' end,
      i % 4 = 0,
      now() - make_interval(days => 60 - i * 3)
    )
    returning id into v_customer;
    v_customers := v_customers || v_customer;
  end loop;

  insert into public.customer_notes (business_id, customer_id, body, created_by)
  values (v_business, v_customers[1], 'Verkiest een koel blond. Allergietest gedaan in maart.', v_owner);

  -- Appointments: last week (completed / no-show) and the next ten days (confirmed / pending)
  for d in -7..10 loop
    v_day := v_today + d;
    foreach v_staff in array array[v_lena, v_amir, v_julie] loop
      v_minute := 540 + ((d + 9) % 3) * 30;
      for i in 1..4 loop
        select s.id, s.name, coalesce(ss.duration_minutes, s.duration_minutes) as duration,
               coalesce(ss.price_cents, s.promo_price_cents, s.price_cents) as price, s.buffer_after_minutes as buffer
        into v_service
        from public.staff_services ss join public.services s on s.id = ss.service_id
        where ss.staff_id = v_staff
        order by md5(ss.service_id::text || d::text || i::text)
        limit 1;

        -- Only inside this professional's working hours for that weekday.
        exit when not exists (
          select 1 from public.staff_working_hours w
          where w.staff_id = v_staff and w.weekday = extract(isodow from v_day)
            and w.start_minute <= v_minute and w.end_minute >= v_minute + v_service.duration
        );
        if (d * 3 + i) % 5 <> 0 then
          v_start := (v_day::timestamp + make_interval(mins => v_minute)) at time zone 'Europe/Brussels';
          v_status := case
            when d < 0 and (d + i) % 9 = 0 then 'no_show'
            when d < 0 then 'completed'
            when d > 1 and (d + i) % 7 = 0 then 'pending'
            else 'confirmed' end;
          insert into public.appointments (
            business_id, location_id, staff_id, customer_id, service_id, service_name, duration_minutes, price_cents,
            currency, starts_at, ends_at, blocked_until, status, source, created_by
          ) values (
            v_business, v_location, v_staff, v_customers[1 + abs(hashtext(v_staff::text || d::text || i::text)) % 18],
            v_service.id, v_service.name, v_service.duration, v_service.price, 'EUR',
            v_start, v_start + make_interval(mins => v_service.duration),
            v_start + make_interval(mins => v_service.duration + v_service.buffer),
            v_status, case when i % 2 = 0 then 'online'::public.appointment_source else 'staff'::public.appointment_source end, v_owner
          );
        end if;
        v_minute := v_minute + v_service.duration + v_service.buffer + 15;
      end loop;
    end loop;
  end loop;
end;
$$;

-- Recorded payments for completed demo visits, and a few demo expenses.
insert into public.payments (business_id, appointment_id, customer_id, amount_cents, currency, method, paid_at, recorded_by)
select a.business_id, a.id, a.customer_id, a.price_cents, a.currency,
       (array['card', 'bancontact', 'cash', 'card']::public.payment_method[])[1 + abs(hashtext(a.id::text)) % 4],
       a.ends_at, '11111111-1111-4111-8111-111111111111'
from public.appointments a
where a.business_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and a.status = 'completed';

insert into public.expenses (business_id, category, description, amount_cents, currency, spent_on, supplier, reference, created_by)
select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', e.category::public.expense_category, e.description, e.amount_cents, 'EUR',
       (now() at time zone 'Europe/Brussels')::date - e.days_ago, e.supplier, e.reference, '11111111-1111-4111-8111-111111111111'
from (values
  ('products', 'Aanvulling kleuring en toner', 48650, 3, 'Demo Beauty Supplies', 'INV-2026-114'),
  ('rent', 'Huur salon', 145000, 6, 'Demo Vastgoedbeheer', null),
  ('software', 'Software voor online boeken en salonbeheer', 4900, 8, null, null),
  ('marketing', 'Instagramcampagne', 7500, 10, null, null)
) as e (category, description, amount_cents, days_ago, supplier, reference);

-- Retail demo: products with stock, an online shop and two click-and-collect orders.
update public.businesses set shop_enabled = true where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

with created as (
  insert into public.products (business_id, name, description, sku, category, price_cents, cost_cents, low_stock_threshold, is_online)
  values
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Herstellend haarmasker', 'Wekelijkse verzorging voor gekleurd haar. 200 ml.', 'NR-MASK-200', 'Haarverzorging', 3450, 1600, 3, true),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Milde kleurshampoo', 'Sulfaatvrije shampoo die de kleur beschermt. 300 ml.', 'NR-SHAM-300', 'Haarverzorging', 2400, 1050, 4, true),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Hittebeschermende spray', 'Lichte spray die beschermt tot 230 °C. 150 ml.', 'NR-MIST-150', 'Styling', 2650, 1150, 3, true),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Textuurpasta', 'Matte, soepele fixatie voor kort haar. 75 ml.', 'NR-PASTE-75', 'Styling', 1950, 800, 3, true),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Grove kam', 'Met de hand afgewerkte kam in acetaat.', 'NR-COMB', 'Accessoires', 1200, 400, 2, false)
  returning id, sku
)
insert into public.inventory_movements (business_id, product_id, quantity_change, reason, note, created_by)
select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', id,
       case sku when 'NR-MASK-200' then 12 when 'NR-SHAM-300' then 18 when 'NR-MIST-150' then 2 when 'NR-PASTE-75' then 9 else 6 end,
       'initial', 'Beginvoorraad', '11111111-1111-4111-8111-111111111111'
from created;

select public.create_online_order(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  jsonb_build_array(
    jsonb_build_object('product_id', (select id from public.products where sku = 'NR-MASK-200'), 'quantity', 1),
    jsonb_build_object('product_id', (select id from public.products where sku = 'NR-SHAM-300'), 'quantity', 2)
  ),
  'Sofie', 'Janssens', 'client1@example.test', '+32 470 107919', 'Ik haal het vrijdag op'
);
select public.create_online_order(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  jsonb_build_array(jsonb_build_object('product_id', (select id from public.products where sku = 'NR-PASTE-75'), 'quantity', 1)),
  'Lucas', 'Dubois', 'client2@example.test', '+32 470 115838', null
);
update public.notifications set status = 'skipped', last_error = 'No email provider configured', processed_at = now() where status = 'pending';
