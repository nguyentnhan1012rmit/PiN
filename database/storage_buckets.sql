-- Create Buckets
insert into storage.buckets (id, name, public)
values 
  ('posts', 'posts', true),
  ('avatars', 'avatars', true),
  ('covers', 'covers', true)
on conflict (id) do nothing;

-- 1. Allow public access to all files in these buckets
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('posts', 'avatars', 'covers') );

-- 2. Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id in ('posts', 'avatars', 'covers')
  );

-- 3. Allow users to update their own files (if needed, e.g. overwriting avatar)
create policy "Users can update own files"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id in ('posts', 'avatars', 'covers') );

-- 4. Allow users to delete their own files
create policy "Users can delete own files"
  on storage.objects for delete
  using ( auth.uid() = owner AND bucket_id in ('posts', 'avatars', 'covers') );
