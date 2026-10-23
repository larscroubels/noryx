-- Profiles for accounts that signed up before the migrations ran. handle_new_user()
-- only creates a profile for new sign-ups, so accounts that already existed in
-- auth.users (production, 2026-10-24) had none. Safe to run more than once.

insert into public.profiles (id, full_name)
select u.id, nullif(btrim(left(coalesce(u.raw_user_meta_data ->> 'full_name', ''), 120)), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
