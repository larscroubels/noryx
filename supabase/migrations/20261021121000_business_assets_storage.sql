-- Public brand images (logo, cover) for business pages, stored in Supabase Storage.
--
-- Files live under "<business_id>/..." in the public "business-assets" bucket.
-- Anyone may read them (they appear on public booking pages); only members with
-- settings.manage may write inside their own business folder. Size and MIME
-- type are limited by the bucket, and the app additionally checks file
-- signatures before uploading.
--
-- Guarded so the migration also runs where Supabase Storage is absent (tests).

do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Supabase Storage not installed; skipping business-assets bucket.';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('business-assets', 'business-assets', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
  on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

  execute $policy$
    create policy "business-assets: settings managers upload"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'business-assets'
      and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
      and public.can_manage(((storage.foldername(name))[1])::uuid, 'settings.manage')
    )
  $policy$;

  execute $policy$
    create policy "business-assets: settings managers update"
    on storage.objects for update to authenticated
    using (
      bucket_id = 'business-assets'
      and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
      and public.can_manage(((storage.foldername(name))[1])::uuid, 'settings.manage')
    )
  $policy$;

  execute $policy$
    create policy "business-assets: settings managers delete"
    on storage.objects for delete to authenticated
    using (
      bucket_id = 'business-assets'
      and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
      and public.can_manage(((storage.foldername(name))[1])::uuid, 'settings.manage')
    )
  $policy$;
end;
$$;
