-- Connection codes use up to four letters of the slug (rpad() truncated them to three).
-- Codes already issued stay valid.
create or replace function public.new_connection_code(p_business_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_letters text;
  v_prefix text;
  v_code text;
  v_bytes bytea;
begin
  select left(regexp_replace(upper(slug), '[^A-Z]', '', 'g'), 4) into v_letters
  from public.businesses where id = p_business_id;
  v_prefix := case when length(v_letters) >= 3 then v_letters else rpad(coalesce(v_letters, ''), 3, 'X') end;
  loop
    v_bytes := extensions.gen_random_bytes(2);
    v_code := v_prefix || '-' || lpad(((get_byte(v_bytes, 0) * 256 + get_byte(v_bytes, 1)) % 10000)::text, 4, '0');
    exit when not exists (select 1 from public.business_connection_codes where code = v_code);
  end loop;
  return v_code;
end;
$$;

revoke execute on function public.new_connection_code(uuid) from public, anon, authenticated;
