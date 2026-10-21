-- Tightens the property-images storage policy. Previously ANY authenticated
-- user could upload to ANY path in this bucket, regardless of whether they
-- owned an organization or the property the image belonged to. Now uploads
-- (and updates/deletes) are restricted to files under the uploader's own
-- organization folder: property-images/<organization_id>/...

drop policy if exists "Organization owners upload property images" on storage.objects;

create policy "Organization owners upload their own property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations where owner_id = auth.uid()
    )
  );

create policy "Organization owners update their own property images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations where owner_id = auth.uid()
    )
  );

create policy "Organization owners delete their own property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations where owner_id = auth.uid()
    )
  );
