-- The salon's own domain and one-page website become an extra on Pro instead of a
-- separate plan (decision by the product owner, 2026-10-24). Plans are Basic and Pro.
--
-- Pro salons are eligible (feature custom_domain). The extra itself, a one-time fee
-- (src/lib/billing/pricing.ts), is taken when a platform admin assigns the domain;
-- no billing provider is integrated. Domains only resolve while the salon is on Pro.

update public.plans
set features = array_append(features, 'custom_domain')
where id = 'pro' and not ('custom_domain' = any (features));

-- Nobody loses anything: Pro now has every feature Ultra had.
update public.business_subscriptions set plan_id = 'pro' where plan_id = 'ultra';
delete from public.plans where id = 'ultra';

create or replace function public.admin_set_custom_domain(p_business_id uuid, p_domain text, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain text := nullif(lower(regexp_replace(btrim(coalesce(p_domain, '')), '^(https?://)?(www\.)?', '')), '');
  v_previous text;
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;
  -- Removing a domain is always allowed; adding one only for salons on Pro.
  if v_domain is not null and not public.business_has_feature(p_business_id, 'custom_domain') then
    raise exception 'plan_feature_custom_domain' using errcode = 'P0001';
  end if;
  select custom_domain into v_previous from public.businesses where id = p_business_id;
  update public.businesses set custom_domain = v_domain where id = p_business_id;
  perform public.log_audit_event(p_business_id, 'business.custom_domain_changed', 'business', p_business_id::text,
    jsonb_build_object('from', v_previous, 'to', v_domain, 'reason', btrim(p_reason)));
end;
$$;
