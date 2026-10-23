-- Reports the newest migration applied to this database, so the app can tell
-- whether the database is up to date with the deployed code (GET /api/health).
-- Returns null when the migration history table isn't available (for example
-- when the SQL was run by hand instead of with `supabase db push`).

create function public.schema_version()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return (select max(version) from supabase_migrations.schema_migrations);
exception
  when undefined_table or invalid_schema_name or insufficient_privilege then
    return null;
end;
$$;

revoke execute on function public.schema_version() from public;
grant execute on function public.schema_version() to anon, authenticated, service_role;
