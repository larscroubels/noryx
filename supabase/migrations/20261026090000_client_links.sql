-- Client accounts link to salons with the salon's own connection code (NORYX app).
--
-- One active code per salon, shown in the workspace and regenerable by settings
-- managers. A client with a confirmed email links a salon by entering its code; the
-- link points at the salon's own customer record for that email (reused, or created
-- within the plan's customer limit). Unlinking only stamps unlinked_at: the salon's
-- records and appointments are never touched.
--
-- Failed codes are counted per user (10 per 15 minutes). Expected failures are
-- returned as {"error": ...} rather than raised, because raising would roll back the
-- recorded attempt and defeat the limit.
--
-- Rollback: drop the functions below, then client_links, connection_code_attempts,
-- business_connection_codes and the client_category type.

create type public.client_category as enum ('hair', 'nails', 'beauty', 'brows', 'lashes', 'other');

-- ── Connection codes ────────────────────────────────────────────────────────
create table public.business_connection_codes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z]{3,4}-[0-9]{4}$'),
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index business_connection_codes_one_active
  on public.business_connection_codes (business_id) where active;

alter table public.business_connection_codes enable row level security;
create policy "business_connection_codes: members read" on public.business_connection_codes
  for select to authenticated using (public.is_business_member(business_id));
revoke all on table public.business_connection_codes from anon, authenticated;
grant select on public.business_connection_codes to authenticated;

-- ── Client links ────────────────────────────────────────────────────────────
create table public.client_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null,
  categories public.client_category[] not null check (cardinality(categories) between 1 and 6),
  linked_at timestamptz not null default now(),
  unlinked_at timestamptz,
  unique (user_id, business_id),
  foreign key (business_id, customer_id) references public.customers (business_id, id) on delete cascade
);

create index client_links_business_idx on public.client_links (business_id);

alter table public.client_links enable row level security;
create policy "client_links: own" on public.client_links
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on table public.client_links from anon, authenticated;
grant select on public.client_links to authenticated;

-- Internal: failed code attempts, for the per-user limit.
create table public.connection_code_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index connection_code_attempts_user_idx on public.connection_code_attempts (user_id, attempted_at desc);
alter table public.connection_code_attempts enable row level security;
revoke all on table public.connection_code_attempts from anon, authenticated;

-- ── Helpers ─────────────────────────────────────────────────────────────────
-- Up to four letters from the slug (padded with X) + four random digits, e.g. STUD-4821.
create function public.new_connection_code(p_business_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_prefix text;
  v_code text;
  v_bytes bytea;
begin
  select rpad(left(regexp_replace(upper(slug), '[^A-Z]', '', 'g'), 4), 3, 'X') into v_prefix
  from public.businesses where id = p_business_id;
  loop
    v_bytes := extensions.gen_random_bytes(2);
    v_code := v_prefix || '-' || lpad(((get_byte(v_bytes, 0) * 256 + get_byte(v_bytes, 1)) % 10000)::text, 4, '0');
    exit when not exists (select 1 from public.business_connection_codes where code = v_code);
  end loop;
  return v_code;
end;
$$;

-- The salon's active code, created on first use. Any active member may read it.
create function public.ensure_connection_code(p_business_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if not public.is_business_member(p_business_id) then
    raise exception 'You do not have access to this business' using errcode = '42501';
  end if;
  select code into v_code from public.business_connection_codes where business_id = p_business_id and active;
  if v_code is null then
    v_code := public.new_connection_code(p_business_id);
    insert into public.business_connection_codes (business_id, code, created_by)
    values (p_business_id, v_code, (select auth.uid()));
  end if;
  return v_code;
end;
$$;

-- A new code; the old one stops working, existing links stay.
create function public.regenerate_connection_code(p_business_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if not public.can_manage(p_business_id, 'settings.manage') then
    raise exception 'You do not have permission to change the connection code' using errcode = '42501';
  end if;
  update public.business_connection_codes set active = false where business_id = p_business_id and active;
  v_code := public.new_connection_code(p_business_id);
  insert into public.business_connection_codes (business_id, code, created_by)
  values (p_business_id, v_code, (select auth.uid()));
  perform public.log_audit_event(p_business_id, 'connection_code.regenerated', 'business', p_business_id::text, '{}'::jsonb);
  return v_code;
end;
$$;

-- ── Linking ─────────────────────────────────────────────────────────────────
create function public.link_business_by_code(p_code text, p_categories public.client_category[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_email text;
  v_name text;
  v_confirmed boolean;
  v_business public.businesses%rowtype;
  v_customer uuid;
  v_categories public.client_category[];
begin
  if v_user is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  select lower(email), email_confirmed_at is not null into v_email, v_confirmed from auth.users where id = v_user;
  if v_confirmed is not true then
    return jsonb_build_object('error', 'email_not_confirmed');
  end if;
  if (select count(*) from public.connection_code_attempts
      where user_id = v_user and attempted_at > now() - interval '15 minutes') >= 10 then
    return jsonb_build_object('error', 'too_many_attempts');
  end if;

  select b.* into v_business
  from public.business_connection_codes c
  join public.businesses b on b.id = c.business_id
  where c.code = upper(btrim(coalesce(p_code, ''))) and c.active and b.status = 'active';
  if not found then
    insert into public.connection_code_attempts (user_id) values (v_user);
    return jsonb_build_object('error', 'connection_code_invalid');
  end if;

  select array_agg(distinct c order by c) into v_categories from unnest(p_categories) c;
  if v_categories is null then
    return jsonb_build_object('error', 'categories_required');
  end if;

  -- Reuse the salon's record for this email; otherwise create one within the plan limit.
  select id into v_customer from public.customers
  where business_id = v_business.id and lower(email) = v_email;
  if v_customer is null then
    select coalesce(nullif(btrim(full_name), ''), split_part(v_email, '@', 1)) into v_name
    from public.profiles where id = v_user;
    v_name := coalesce(v_name, split_part(v_email, '@', 1));
    begin
      insert into public.customers (business_id, first_name, last_name, email, source, user_id)
      values (v_business.id, left(split_part(v_name, ' ', 1), 80),
        nullif(left(btrim(substr(v_name, length(split_part(v_name, ' ', 1)) + 1)), 80), ''),
        v_email, 'manual', v_user)
      returning id into v_customer;
    exception when others then
      if sqlerrm = 'plan_limit_customers' then
        return jsonb_build_object('error', 'plan_limit_customers');
      end if;
      raise;
    end;
  else
    update public.customers set user_id = v_user where id = v_customer and user_id is distinct from v_user;
  end if;

  insert into public.client_links (user_id, business_id, customer_id, categories)
  values (v_user, v_business.id, v_customer, v_categories)
  on conflict (user_id, business_id) do update
    set categories = excluded.categories, customer_id = excluded.customer_id, unlinked_at = null;

  return jsonb_build_object('business_id', v_business.id, 'slug', v_business.slug,
    'name', v_business.name, 'categories', to_jsonb(v_categories));
end;
$$;

create function public.unlink_business(p_business_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.client_links set unlinked_at = now()
  where user_id = (select auth.uid()) and business_id = p_business_id and unlinked_at is null;
$$;

create function public.my_client_links()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business_id', b.id, 'slug', b.slug, 'name', b.name, 'logo_path', b.logo_path,
    'categories', to_jsonb(l.categories), 'linked_at', l.linked_at, 'unlinked_at', l.unlinked_at
  )
  from public.client_links l
  join public.businesses b on b.id = l.business_id
  where l.user_id = (select auth.uid())
  order by l.unlinked_at nulls first, l.linked_at;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────
revoke execute on function public.new_connection_code(uuid) from public, anon, authenticated;
revoke execute on function public.ensure_connection_code(uuid) from public, anon;
revoke execute on function public.regenerate_connection_code(uuid) from public, anon;
revoke execute on function public.link_business_by_code(text, public.client_category[]) from public, anon;
revoke execute on function public.unlink_business(uuid) from public, anon;
revoke execute on function public.my_client_links() from public, anon;
grant execute on function public.ensure_connection_code(uuid) to authenticated;
grant execute on function public.regenerate_connection_code(uuid) to authenticated;
grant execute on function public.link_business_by_code(text, public.client_category[]) to authenticated;
grant execute on function public.unlink_business(uuid) to authenticated;
grant execute on function public.my_client_links() to authenticated;
