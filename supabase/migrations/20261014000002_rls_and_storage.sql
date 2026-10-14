-- Row Level Security + Storage policies.
-- Principle: anonymous visitors can read ONLY published storefront content; every write needs
-- private.is_admin(); stock changes and order creation go through SECURITY DEFINER functions.

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.banners enable row level security;
alter table public.site_settings enable row level security;

-- ---- categories ------------------------------------------------------------
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select to anon, authenticated
  using (is_published or private.is_admin());

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- products --------------------------------------------------------------
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select to anon, authenticated
  using (status = 'published' or private.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- product_categories ----------------------------------------------------
drop policy if exists "product_categories public read" on public.product_categories;
create policy "product_categories public read" on public.product_categories
  for select to anon, authenticated
  using (
    private.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );

drop policy if exists "product_categories admin write" on public.product_categories;
create policy "product_categories admin write" on public.product_categories
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- product_images --------------------------------------------------------
drop policy if exists "product_images public read" on public.product_images;
create policy "product_images public read" on public.product_images
  for select to anon, authenticated
  using (
    private.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );

drop policy if exists "product_images admin write" on public.product_images;
create policy "product_images admin write" on public.product_images
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- product_variants ------------------------------------------------------
drop policy if exists "product_variants public read" on public.product_variants;
create policy "product_variants public read" on public.product_variants
  for select to anon, authenticated
  using (
    private.is_admin()
    or (is_active and exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'))
  );

drop policy if exists "product_variants admin write" on public.product_variants;
create policy "product_variants admin write" on public.product_variants
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- inventory_movements (admin read only; writes happen inside definer functions) ----
drop policy if exists "inventory_movements admin read" on public.inventory_movements;
create policy "inventory_movements admin read" on public.inventory_movements
  for select to authenticated using (private.is_admin());

-- ---- banners (published AND inside the schedule window) --------------------
drop policy if exists "banners public read" on public.banners;
create policy "banners public read" on public.banners
  for select to anon, authenticated
  using (
    private.is_admin()
    or (
      status = 'published'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now())
    )
  );

drop policy if exists "banners admin write" on public.banners;
create policy "banners admin write" on public.banners
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- site_settings ---------------------------------------------------------
drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings
  for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---- orders: creation ONLY through public.place_order() (stock-safe) ---------
-- The old policy let any client insert arbitrary orders directly, bypassing stock checks.
drop policy if exists "orders owner insert" on public.orders;

-- ---- profiles: keep self-update, never allow role escalation ---------------
-- (existing "profiles self update" policy already pins `role`; admin authority lives in
--  user_roles, which has no client write policy at all.)

-- ---------------------------------------------------------------------------
-- Storage buckets (public read via CDN URL; writes admin-only, avatars owner-only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images',  'product-images',  true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('banners',         'banners',         true, 8388608, array['image/jpeg','image/png','image/webp','image/avif']),
  ('avatars',         'avatars',         true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cms media admin all" on storage.objects;
create policy "cms media admin all" on storage.objects
  for all to authenticated
  using (bucket_id in ('product-images', 'category-images', 'banners') and private.is_admin())
  with check (bucket_id in ('product-images', 'category-images', 'banners') and private.is_admin());

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Realtime: let the public storefront refresh instantly when content changes.
-- (RLS still applies to what each subscriber may receive.)
do $$
declare
  t text;
begin
  foreach t in array array['products', 'categories', 'banners', 'site_settings'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when others then
      null; -- already a member, or the realtime publication is not available
    end;
  end loop;
end $$;
