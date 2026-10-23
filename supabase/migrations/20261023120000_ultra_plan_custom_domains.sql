-- Ultra plan and custom domains.
--
-- Ultra is everything in Pro plus the business's own domain name (e.g.
-- hairsalonsylvie.be instead of noryx.be/hairsalonsylvie) and a one-page site
-- set up by the NORYX team for a one-time fee (src/lib/billing/pricing.ts).
-- The monthly price is not set yet and no billing provider is integrated.
--
-- Custom domains are assigned by platform admins once DNS points to NORYX; the
-- proxy maps the domain to the business's public page via resolve_custom_domain().

insert into public.plans (id, name, description, monthly_price_cents, max_staff, max_members, max_customers, features, sort_order)
select 'ultra', 'Ultra', 'Everything in Pro plus your own domain name and a custom one-page website.',
  null, null, null, null, array_append(p.features, 'custom_domain'), 2
from public.plans p
where p.id = 'pro';

alter table public.businesses
  add column custom_domain text unique
    check (custom_domain is null or custom_domain ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$');

-- Public: which business page a custom domain shows (only active, published Ultra businesses).
create function public.resolve_custom_domain(p_host text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select b.slug
  from public.businesses b
  where b.custom_domain = lower(regexp_replace(split_part(coalesce(p_host, ''), ':', 1), '^www\.', ''))
    and b.status = 'active'
    and b.booking_enabled
    and public.business_has_feature(b.id, 'custom_domain');
$$;

create function public.admin_set_custom_domain(p_business_id uuid, p_domain text, p_reason text)
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
  select custom_domain into v_previous from public.businesses where id = p_business_id;
  update public.businesses set custom_domain = v_domain where id = p_business_id;
  perform public.log_audit_event(p_business_id, 'business.custom_domain_changed', 'business', p_business_id::text,
    jsonb_build_object('from', v_previous, 'to', v_domain, 'reason', btrim(p_reason)));
end;
$$;

revoke execute on function public.resolve_custom_domain(text) from public;
grant execute on function public.resolve_custom_domain(text) to anon, authenticated;
revoke execute on function public.admin_set_custom_domain(uuid, text, text) from public, anon;
grant execute on function public.admin_set_custom_domain(uuid, text, text) to authenticated;
