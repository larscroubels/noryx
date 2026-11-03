-- Linking a salon again for another service keeps the services it already had,
-- atomically in the database (the app no longer needs two calls for it).
create or replace function public.link_business_by_code(p_code text, p_categories public.client_category[])
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
  -- Parallel calls would otherwise all count fewer than ten attempts.
  perform pg_advisory_xact_lock(hashtext('connection_code_attempts:' || v_user::text));
  delete from public.connection_code_attempts
  where user_id = v_user and attempted_at <= now() - interval '15 minutes';
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
    -- Someone else is still linked to this record (e.g. the salon changed its email).
    if exists (
      select 1 from public.client_links
      where business_id = v_business.id and customer_id = v_customer and user_id <> v_user and unlinked_at is null
    ) then
      return jsonb_build_object('error', 'customer_already_linked');
    end if;
    update public.customers set user_id = v_user where id = v_customer and user_id is distinct from v_user;
  end if;

  -- A live link keeps its services and gains the new ones in one statement (linking a
  -- salon for a second service must not drop the first); a re-link starts afresh.
  insert into public.client_links (user_id, business_id, customer_id, categories)
  values (v_user, v_business.id, v_customer, v_categories)
  on conflict (user_id, business_id) do update
    set categories = case
          when public.client_links.unlinked_at is null then (
            select array_agg(distinct c order by c)
            from unnest(public.client_links.categories || excluded.categories) c
          )
          else excluded.categories
        end,
        customer_id = excluded.customer_id,
        unlinked_at = null
  returning categories into v_categories;

  return jsonb_build_object('business_id', v_business.id, 'slug', v_business.slug,
    'name', v_business.name, 'categories', to_jsonb(v_categories));
end;
$$;
