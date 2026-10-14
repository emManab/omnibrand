-- ========================================================
-- CALCUTTAPRESS ALL-IN-ONE SETUP SCRIPT
-- Creates all tables, security, functions AND loads all
-- categories, products, banners, and default settings.
-- ========================================================

-- =========================================================
-- Calcuttapress Complete Database Schema & Functions
-- Run this entire script in Supabase Dashboard -> SQL Editor
-- =========================================================


-- >>>>>>>>>>>>>> START OF 20241012000000_omnibrand.sql <<<<<<<<<<<<<<

-- OmniBrand schema. Enable RLS. Admin role lives in app_metadata, never user_metadata.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  category text not null,
  from_price numeric not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  name text not null,
  phone text,
  address text,
  city text,
  pincode text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  shipping numeric not null,
  total numeric not null,
  status text not null default 'pending_payment',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated, anon;

create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or private.is_admin());

create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "products public read" on public.products
  for select using (true);

create policy "products admin write" on public.products
  for all using (private.is_admin()) with check (private.is_admin());

create policy "orders owner read" on public.orders
  for select using (auth.uid() = user_id or email = auth.jwt() ->> 'email' or private.is_admin());

create policy "orders owner insert" on public.orders
  for insert with check (
    auth.uid() = user_id or user_id is null or private.is_admin()
  );

create policy "orders admin update" on public.orders
  for update using (private.is_admin()) with check (private.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', false)
on conflict (id) do nothing;

create policy "artwork owner upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artwork' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "artwork owner read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'artwork'
    and (auth.uid()::text = (storage.foldername(name))[1] or private.is_admin())
  );

create policy "artwork owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'artwork' and auth.uid()::text = (storage.foldername(name))[1]);


-- >>>>>>>>>>>>>> END OF 20241012000000_omnibrand.sql <<<<<<<<<<<<<<


-- >>>>>>>>>>>>>> START OF 20261014000001_catalog_schema.sql <<<<<<<<<<<<<<

-- Calcuttapress catalog + CMS schema.
-- Run AFTER 20241012000000_omnibrand.sql.
--
-- NOTE: the original migration created a minimal, never-written `public.products` table
-- (text id, from_price). It is replaced here by the full catalog model.

create extension if not exists "pgcrypto";
create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Authorization: database-controlled admin role
-- ---------------------------------------------------------------------------
-- user_roles has RLS enabled and NO insert/update/delete policy, so no client (anon or
-- authenticated) can ever grant itself a role. Rows are inserted only from the SQL editor /
-- service role (see docs/SUPABASE_SETUP.md).
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;

drop policy if exists "user_roles read own" on public.user_roles;
create policy "user_roles read own" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

-- Trusted admin check. Reads user_roles (DB) or the server-controlled app_metadata claim
-- (never user_metadata, which the user can edit).
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
           select 1 from public.user_roles r
           where r.user_id = auth.uid() and r.role = 'admin'
         )
         or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

-- Lets the frontend ask "am I an admin?" without exposing the private schema.
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select private.is_admin();
$$;
grant execute on function public.am_i_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.publish_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: avatar for the admin profile page
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Categories (nested)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  nav_label text,
  short_description text,
  description text,
  image_path text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  show_in_nav boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_not_own_parent check (parent_id is distinct from id)
);
create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_published_sort_idx
  on public.categories (sort_order) where is_published;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
drop table if exists public.products cascade;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku text unique check (sku is null or length(trim(sku)) > 0),
  name text not null check (length(trim(name)) > 0),
  tagline text not null default '',
  description text not null default '',
  -- pricing (INR). `price` is the regular "from" price used by the print-price calculator.
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  status public.publish_status not null default 'draft',
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_trending boolean not null default false,
  is_new boolean not null default false,
  -- inventory
  track_inventory boolean not null default true,
  made_to_order boolean not null default false,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  -- Derived, filterable availability. Made-to-order never becomes unavailable just because
  -- tracked stock is zero.
  availability text generated always as (
    case
      when made_to_order then 'made_to_order'
      when not track_inventory then 'in_stock'
      when stock_quantity <= 0 then 'out_of_stock'
      when stock_quantity <= low_stock_threshold then 'low_stock'
      else 'in_stock'
    end
  ) stored,
  -- existing storefront presentation fields
  editor_preset text not null default 'card'
    check (editor_preset in ('card', 'apparel', 'mug', 'packaging', 'sticker', 'banner')),
  accent text not null default '#EEF3FF',
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  -- {sizes:[{id,label,multiplier}], materials:[...], finishes:[...], quantities:[n,...]}
  print_options jsonb not null default '{}'::jsonb check (jsonb_typeof(print_options) = 'object'),
  primary_image_path text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on public.products (status, created_at desc);
create index products_featured_idx on public.products (is_featured) where status = 'published';
create index products_bestseller_idx on public.products (is_bestseller) where status = 'published';
create index products_trending_idx on public.products (is_trending) where status = 'published';
create index products_new_idx on public.products (is_new) where status = 'published';
create index products_availability_idx on public.products (availability);
create index products_updated_idx on public.products (updated_at desc);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- Many-to-many product <-> category; exactly one primary per product.
create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  is_primary boolean not null default false,
  primary key (product_id, category_id)
);
create index product_categories_category_idx on public.product_categories (category_id);
create unique index product_categories_one_primary
  on public.product_categories (product_id) where is_primary;

-- Gallery
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null check (length(trim(path)) > 0),
  alt text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);
create unique index product_images_one_primary
  on public.product_images (product_id) where is_primary;

-- Keeps products.primary_image_path in sync so list queries need no join.
create or replace function public.sync_product_primary_image()
returns trigger
language plpgsql
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
     set primary_image_path = (
       select i.path from public.product_images i
        where i.product_id = pid
        order by i.is_primary desc, i.sort_order asc, i.created_at asc
        limit 1)
   where p.id = pid;
  return null;
end;
$$;
create trigger product_images_sync_primary
  after insert or update or delete on public.product_images
  for each row execute function public.sync_product_primary_image();

-- Variants (size / colour / material ...). When a product has active variants and tracks
-- inventory, stock is held per variant and products.stock_quantity is their sum.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text unique check (sku is null or length(trim(sku)) > 0),
  name text not null check (length(trim(name)) > 0),
  option_values jsonb not null default '{}'::jsonb check (jsonb_typeof(option_values) = 'object'),
  price_delta numeric(12, 2) not null default 0,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

create or replace function public.sync_product_stock_from_variants()
returns trigger
language plpgsql
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  if exists (select 1 from public.product_variants v where v.product_id = pid and v.is_active) then
    update public.products
       set stock_quantity = coalesce((
         select sum(v.stock_quantity) from public.product_variants v
          where v.product_id = pid and v.is_active), 0)
     where id = pid;
  end if;
  return null;
end;
$$;
create trigger product_variants_sync_stock
  after insert or update or delete on public.product_variants
  for each row execute function public.sync_product_stock_from_variants();

-- Append-only stock ledger
create table public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  delta integer not null,
  quantity_after integer not null check (quantity_after >= 0),
  reason text not null check (length(trim(reason)) > 0),
  note text,
  order_id uuid,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index inventory_movements_product_idx
  on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_created_idx on public.inventory_movements (created_at desc);

-- ---------------------------------------------------------------------------
-- Banners / promotional sections
-- ---------------------------------------------------------------------------
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'home_hero'
    check (placement in ('home_hero', 'home_promo_top', 'home_promo_bottom')),
  title text not null check (length(trim(title)) > 0),
  subtitle text,
  description text,
  cta_label text,
  cta_url text,
  product_id uuid references public.products (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  desktop_image_path text,
  mobile_image_path text,
  video_path text,
  -- presentation extras: {gradient, tone, dark, code, validUntil, watermark, footer, ctas:[{label,to}]}
  theme jsonb not null default '{}'::jsonb check (jsonb_typeof(theme) = 'object'),
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_schedule_order check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index banners_placement_idx on public.banners (placement, sort_order) where status = 'published';
create trigger banners_updated_at before update on public.banners
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Site settings (PUBLIC-READABLE storefront content — never store secrets here)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();


-- >>>>>>>>>>>>>> END OF 20261014000001_catalog_schema.sql <<<<<<<<<<<<<<


-- >>>>>>>>>>>>>> START OF 20261014000002_rls_and_storage.sql <<<<<<<<<<<<<<

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


-- >>>>>>>>>>>>>> END OF 20261014000002_rls_and_storage.sql <<<<<<<<<<<<<<


-- >>>>>>>>>>>>>> START OF 20261014000003_functions.sql <<<<<<<<<<<<<<

-- Server-side business logic. Everything here is SECURITY DEFINER with a pinned search_path
-- and checks private.is_admin() itself (admin_*), or validates its own input (place_order).
-- All multi-step operations run inside the function's single transaction.

-- ---------------------------------------------------------------------------
-- Stock adjustment (set / increase / decrease / restock / mark out of stock)
-- ---------------------------------------------------------------------------
create or replace function public.admin_adjust_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_mode text,            -- 'delta' | 'set'
  p_amount integer,
  p_reason text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
  v_new integer;
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_mode not in ('delta', 'set') then raise exception 'invalid_mode'; end if;
  if p_amount is null then raise exception 'amount_required'; end if;
  if p_reason is null or length(trim(p_reason)) = 0 then raise exception 'reason_required'; end if;

  perform 1 from public.products where id = p_product_id for update;
  if not found then raise exception 'product_not_found'; end if;

  if p_variant_id is not null then
    select stock_quantity into v_current
      from public.product_variants
     where id = p_variant_id and product_id = p_product_id
       for update;
    if not found then raise exception 'variant_not_found'; end if;
  else
    if exists (select 1 from public.product_variants where product_id = p_product_id and is_active) then
      raise exception 'variant_required';
    end if;
    select stock_quantity into v_current from public.products where id = p_product_id;
  end if;

  v_new := case when p_mode = 'set' then p_amount else v_current + p_amount end;
  if v_new < 0 then raise exception 'negative_stock'; end if;

  if p_variant_id is not null then
    update public.product_variants set stock_quantity = v_new where id = p_variant_id;
  else
    update public.products set stock_quantity = v_new where id = p_product_id;
  end if;

  insert into public.inventory_movements
    (product_id, variant_id, delta, quantity_after, reason, note, actor_id)
  values
    (p_product_id, p_variant_id, v_new - v_current, v_new, trim(p_reason), p_note, auth.uid());

  return jsonb_build_object('quantity_after', v_new, 'delta', v_new - v_current);
end;
$$;

-- ---------------------------------------------------------------------------
-- Atomic product save (product + categories + gallery + variants in ONE transaction)
-- ---------------------------------------------------------------------------
create or replace function public.admin_save_product(
  p_id uuid,
  p_product jsonb,
  p_category_ids uuid[],
  p_primary_category uuid,
  p_images jsonb,
  p_variants jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_old_stock integer;
  v_new_stock integer := coalesce((p_product ->> 'stock_quantity')::integer, 0);
  v_has_variants boolean;
  v_el jsonb;
  v_cat uuid;
  v_cats uuid[] := coalesce(p_category_ids, '{}');
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_primary_category is not null and not (p_primary_category = any (v_cats)) then
    v_cats := v_cats || p_primary_category;
  end if;

  if p_id is null then
    insert into public.products (
      slug, sku, name, tagline, description, price, sale_price, status,
      is_featured, is_bestseller, is_trending, is_new,
      track_inventory, made_to_order, stock_quantity, low_stock_threshold,
      editor_preset, accent, rating, review_count, print_options, seo_title, seo_description
    ) values (
      p_product ->> 'slug',
      nullif(trim(coalesce(p_product ->> 'sku', '')), ''),
      p_product ->> 'name',
      coalesce(p_product ->> 'tagline', ''),
      coalesce(p_product ->> 'description', ''),
      (p_product ->> 'price')::numeric,
      nullif(p_product ->> 'sale_price', '')::numeric,
      coalesce(p_product ->> 'status', 'draft')::public.publish_status,
      coalesce((p_product ->> 'is_featured')::boolean, false),
      coalesce((p_product ->> 'is_bestseller')::boolean, false),
      coalesce((p_product ->> 'is_trending')::boolean, false),
      coalesce((p_product ->> 'is_new')::boolean, false),
      coalesce((p_product ->> 'track_inventory')::boolean, true),
      coalesce((p_product ->> 'made_to_order')::boolean, false),
      v_new_stock,
      coalesce((p_product ->> 'low_stock_threshold')::integer, 5),
      coalesce(p_product ->> 'editor_preset', 'card'),
      coalesce(p_product ->> 'accent', '#EEF3FF'),
      coalesce((p_product ->> 'rating')::numeric, 0),
      coalesce((p_product ->> 'review_count')::integer, 0),
      coalesce(p_product -> 'print_options', '{}'::jsonb),
      nullif(p_product ->> 'seo_title', ''),
      nullif(p_product ->> 'seo_description', '')
    ) returning id into v_id;

    if v_new_stock > 0 then
      insert into public.inventory_movements (product_id, delta, quantity_after, reason, actor_id)
      values (v_id, v_new_stock, v_new_stock, 'initial_stock', auth.uid());
    end if;
  else
    v_id := p_id;
    select stock_quantity into v_old_stock from public.products where id = v_id for update;
    if not found then raise exception 'product_not_found'; end if;

    update public.products set
      slug = p_product ->> 'slug',
      sku = nullif(trim(coalesce(p_product ->> 'sku', '')), ''),
      name = p_product ->> 'name',
      tagline = coalesce(p_product ->> 'tagline', ''),
      description = coalesce(p_product ->> 'description', ''),
      price = (p_product ->> 'price')::numeric,
      sale_price = nullif(p_product ->> 'sale_price', '')::numeric,
      status = coalesce(p_product ->> 'status', 'draft')::public.publish_status,
      is_featured = coalesce((p_product ->> 'is_featured')::boolean, false),
      is_bestseller = coalesce((p_product ->> 'is_bestseller')::boolean, false),
      is_trending = coalesce((p_product ->> 'is_trending')::boolean, false),
      is_new = coalesce((p_product ->> 'is_new')::boolean, false),
      track_inventory = coalesce((p_product ->> 'track_inventory')::boolean, true),
      made_to_order = coalesce((p_product ->> 'made_to_order')::boolean, false),
      low_stock_threshold = coalesce((p_product ->> 'low_stock_threshold')::integer, 5),
      editor_preset = coalesce(p_product ->> 'editor_preset', 'card'),
      accent = coalesce(p_product ->> 'accent', '#EEF3FF'),
      rating = coalesce((p_product ->> 'rating')::numeric, 0),
      review_count = coalesce((p_product ->> 'review_count')::integer, 0),
      print_options = coalesce(p_product -> 'print_options', '{}'::jsonb),
      seo_title = nullif(p_product ->> 'seo_title', ''),
      seo_description = nullif(p_product ->> 'seo_description', '')
    where id = v_id;
  end if;

  -- categories (replace set; exactly one primary)
  delete from public.product_categories where product_id = v_id;
  foreach v_cat in array v_cats loop
    insert into public.product_categories (product_id, category_id, is_primary)
    values (v_id, v_cat, coalesce(v_cat = p_primary_category, false));
  end loop;

  -- gallery (replace set; storage objects are cleaned up by the client after commit)
  delete from public.product_images
   where product_id = v_id
     and id not in (
       select (e ->> 'id')::uuid
         from jsonb_array_elements(coalesce(p_images, '[]'::jsonb)) e
        where e ->> 'id' is not null);
  update public.product_images set is_primary = false where product_id = v_id;
  for v_el in select * from jsonb_array_elements(coalesce(p_images, '[]'::jsonb)) loop
    if v_el ->> 'id' is not null then
      update public.product_images
         set alt = v_el ->> 'alt',
             sort_order = coalesce((v_el ->> 'sort_order')::integer, 0),
             is_primary = coalesce((v_el ->> 'is_primary')::boolean, false)
       where id = (v_el ->> 'id')::uuid and product_id = v_id;
    else
      insert into public.product_images (product_id, path, alt, sort_order, is_primary)
      values (
        v_id, v_el ->> 'path', v_el ->> 'alt',
        coalesce((v_el ->> 'sort_order')::integer, 0),
        coalesce((v_el ->> 'is_primary')::boolean, false));
    end if;
  end loop;

  -- variants (stock of existing variants is changed ONLY via admin_adjust_stock)
  delete from public.product_variants
   where product_id = v_id
     and id not in (
       select (e ->> 'id')::uuid
         from jsonb_array_elements(coalesce(p_variants, '[]'::jsonb)) e
        where e ->> 'id' is not null);
  for v_el in select * from jsonb_array_elements(coalesce(p_variants, '[]'::jsonb)) loop
    if v_el ->> 'id' is not null then
      update public.product_variants
         set name = v_el ->> 'name',
             sku = nullif(trim(coalesce(v_el ->> 'sku', '')), ''),
             option_values = coalesce(v_el -> 'option_values', '{}'::jsonb),
             price_delta = coalesce((v_el ->> 'price_delta')::numeric, 0),
             is_active = coalesce((v_el ->> 'is_active')::boolean, true),
             sort_order = coalesce((v_el ->> 'sort_order')::integer, 0)
       where id = (v_el ->> 'id')::uuid and product_id = v_id;
    else
      insert into public.product_variants
        (product_id, name, sku, option_values, price_delta, stock_quantity, is_active, sort_order)
      values (
        v_id, v_el ->> 'name', nullif(trim(coalesce(v_el ->> 'sku', '')), ''),
        coalesce(v_el -> 'option_values', '{}'::jsonb),
        coalesce((v_el ->> 'price_delta')::numeric, 0),
        coalesce((v_el ->> 'stock_quantity')::integer, 0),
        coalesce((v_el ->> 'is_active')::boolean, true),
        coalesce((v_el ->> 'sort_order')::integer, 0));
    end if;
  end loop;

  -- product-level stock edit from the form (only when stock is held on the product itself)
  select exists (select 1 from public.product_variants where product_id = v_id and is_active)
    into v_has_variants;
  if p_id is not null and not v_has_variants and v_new_stock <> v_old_stock then
    update public.products set stock_quantity = v_new_stock where id = v_id;
    insert into public.inventory_movements (product_id, delta, quantity_after, reason, actor_id)
    values (v_id, v_new_stock - v_old_stock, v_new_stock, 'edited_in_product_form', auth.uid());
  end if;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Duplicate a product (as a draft, with categories / gallery / variants)
-- ---------------------------------------------------------------------------
create or replace function public.admin_duplicate_product(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new uuid;
  v_suffix text := substr(md5(random()::text || clock_timestamp()::text), 1, 5);
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  insert into public.products (
    slug, sku, name, tagline, description, price, sale_price, status,
    is_featured, is_bestseller, is_trending, is_new,
    track_inventory, made_to_order, stock_quantity, low_stock_threshold,
    editor_preset, accent, rating, review_count, print_options, seo_title, seo_description
  )
  select
    left(slug, 70) || '-copy-' || v_suffix,
    case when sku is null then null else left(sku, 40) || '-COPY-' || upper(v_suffix) end,
    name || ' (copy)', tagline, description, price, sale_price, 'draft',
    false, false, false, false,
    track_inventory, made_to_order, 0, low_stock_threshold,
    editor_preset, accent, 0, 0, print_options, seo_title, seo_description
  from public.products where id = p_id
  returning id into v_new;

  if v_new is null then raise exception 'product_not_found'; end if;

  insert into public.product_categories (product_id, category_id, is_primary)
  select v_new, category_id, is_primary from public.product_categories where product_id = p_id;

  insert into public.product_images (product_id, path, alt, sort_order, is_primary)
  select v_new, path, alt, sort_order, is_primary from public.product_images where product_id = p_id;

  insert into public.product_variants (product_id, name, sku, option_values, price_delta, stock_quantity, is_active, sort_order)
  select v_new, name, null, option_values, price_delta, 0, is_active, sort_order
    from public.product_variants where product_id = p_id;

  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Categories: safe delete with optional reassignment, atomic reorder
-- ---------------------------------------------------------------------------
create or replace function public.admin_delete_category(p_id uuid, p_reassign_to uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_products uuid[];
  v_primaries uuid[];
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if exists (select 1 from public.categories where parent_id = p_id) then
    raise exception 'category_has_children';
  end if;

  select array_agg(product_id), array_agg(product_id) filter (where is_primary)
    into v_products, v_primaries
    from public.product_categories where category_id = p_id;

  if v_products is not null then
    if p_reassign_to is null then
      raise exception 'category_has_products:%', array_length(v_products, 1);
    end if;
    if p_reassign_to = p_id then raise exception 'invalid_reassign_target'; end if;
    if not exists (select 1 from public.categories where id = p_reassign_to) then
      raise exception 'reassign_target_not_found';
    end if;

    delete from public.product_categories where category_id = p_id;
    insert into public.product_categories (product_id, category_id, is_primary)
    select pid, p_reassign_to, pid = any (coalesce(v_primaries, '{}'))
      from unnest(v_products) as pid
    on conflict (product_id, category_id)
      do update set is_primary = public.product_categories.is_primary or excluded.is_primary;
  end if;

  update public.banners set category_id = p_reassign_to where category_id = p_id;
  delete from public.categories where id = p_id;
end;
$$;

create or replace function public.admin_reorder_categories(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  update public.categories c
     set sort_order = t.ord * 10
    from unnest(p_ids) with ordinality as t(id, ord)
   where c.id = t.id;
end;
$$;

create or replace function public.admin_reorder_banners(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  update public.banners b
     set sort_order = t.ord * 10
    from unnest(p_ids) with ordinality as t(id, ord)
   where b.id = t.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Order placement: atomic stock reservation, no overselling
-- ---------------------------------------------------------------------------
-- Called by the storefront BEFORE payment. Reserves stock and creates the order as
-- 'pending_payment'. Payment verification (edge function) moves it forward; cancelling or
-- releasing a stale order returns stock via the trigger below.
-- Errors (message prefixes the client understands):
--   insufficient_stock:<name>  product_unavailable:<name>  variant_required:<name>
--   variant_unavailable:<name> invalid_item  invalid_quantity  empty_order  invalid_customer
create or replace function public.place_order(
  p_order_id uuid,
  p_customer jsonb,
  p_items jsonb,
  p_subtotal numeric,
  p_shipping numeric,
  p_total numeric,
  p_razorpay_order_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_out jsonb := '[]'::jsonb;
  v_pid uuid;
  v_vid uuid;
  v_qty integer;
  v_prod public.products%rowtype;
  v_var public.product_variants%rowtype;
  v_deduct boolean;
  v_after integer;
  v_name text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order';
  end if;
  if p_subtotal < 0 or p_shipping < 0 or p_total < 0 then raise exception 'invalid_totals'; end if;
  if coalesce(trim(p_customer ->> 'email'), '') = '' or coalesce(trim(p_customer ->> 'name'), '') = '' then
    raise exception 'invalid_customer';
  end if;

  -- Lock every product in a deterministic order (prevents deadlocks between concurrent orders)
  begin
    perform 1
       from public.products
      where id in (
        select distinct (e ->> 'productId')::uuid from jsonb_array_elements(p_items) e)
      order by id
        for update;
  exception when invalid_text_representation then
    raise exception 'invalid_item';
  end;

  for v_item in select * from jsonb_array_elements(p_items) loop
    begin
      v_pid := (v_item ->> 'productId')::uuid;
      v_vid := nullif(v_item ->> 'variantId', '')::uuid;
      v_qty := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'invalid_item';
    end;
    if v_qty is null or v_qty <= 0 then raise exception 'invalid_quantity'; end if;

    select * into v_prod from public.products where id = v_pid;
    if not found then
      raise exception 'product_unavailable:%', coalesce(v_item ->> 'name', v_pid::text);
    end if;
    v_name := v_prod.name;
    if v_prod.status <> 'published' then
      raise exception 'product_unavailable:%', v_name;
    end if;

    v_deduct := false;
    if not v_prod.made_to_order and v_prod.track_inventory then
      v_deduct := true;
      if v_vid is not null then
        select * into v_var from public.product_variants
         where id = v_vid and product_id = v_pid and is_active
           for update;
        if not found then raise exception 'variant_unavailable:%', v_name; end if;
        if v_var.stock_quantity < v_qty then raise exception 'insufficient_stock:%', v_name; end if;
        update public.product_variants set stock_quantity = stock_quantity - v_qty where id = v_vid;
        v_after := v_var.stock_quantity - v_qty;
      else
        if exists (select 1 from public.product_variants where product_id = v_pid and is_active) then
          raise exception 'variant_required:%', v_name;
        end if;
        if v_prod.stock_quantity < v_qty then raise exception 'insufficient_stock:%', v_name; end if;
        update public.products set stock_quantity = stock_quantity - v_qty where id = v_pid;
        v_after := v_prod.stock_quantity - v_qty;
      end if;

      insert into public.inventory_movements
        (product_id, variant_id, delta, quantity_after, reason, order_id, actor_id)
      values (v_pid, v_vid, -v_qty, v_after, 'order', p_order_id, auth.uid());
    end if;

    v_out := v_out || jsonb_build_array(v_item || jsonb_build_object('stockDeducted', v_deduct));
  end loop;

  insert into public.orders
    (id, user_id, email, name, phone, address, city, pincode, items,
     subtotal, shipping, total, status, razorpay_order_id)
  values
    (p_order_id, auth.uid(), trim(p_customer ->> 'email'), trim(p_customer ->> 'name'),
     p_customer ->> 'phone', p_customer ->> 'address', p_customer ->> 'city', p_customer ->> 'pincode',
     v_out, p_subtotal, p_shipping, p_total, 'pending_payment', p_razorpay_order_id);

  return jsonb_build_object('order_id', p_order_id, 'status', 'pending_payment');
end;
$$;

-- Return reserved stock when an order is cancelled (by an admin, or released as stale)
create or replace function public.restock_on_order_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_pid uuid;
  v_vid uuid;
  v_qty integer;
  v_after integer;
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    for v_item in select * from jsonb_array_elements(old.items) loop
      continue when coalesce((v_item ->> 'stockDeducted')::boolean, false) = false;
      v_after := null;
      v_pid := (v_item ->> 'productId')::uuid;
      v_vid := nullif(v_item ->> 'variantId', '')::uuid;
      v_qty := (v_item ->> 'quantity')::integer;

      if v_vid is not null then
        update public.product_variants set stock_quantity = stock_quantity + v_qty
         where id = v_vid and product_id = v_pid
        returning stock_quantity into v_after;
      else
        update public.products set stock_quantity = stock_quantity + v_qty
         where id = v_pid
        returning stock_quantity into v_after;
      end if;

      if v_after is not null then
        insert into public.inventory_movements
          (product_id, variant_id, delta, quantity_after, reason, order_id, actor_id)
        values (v_pid, v_vid, v_qty, v_after, 'order_cancelled', old.id, auth.uid());
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel
  after update of status on public.orders
  for each row execute function public.restock_on_order_cancel();

-- Cancel abandoned checkouts so their reserved stock is released
create or replace function public.admin_release_stale_orders(p_minutes integer default 60)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  with c as (
    update public.orders set status = 'cancelled'
     where status = 'pending_payment'
       and created_at < now() - make_interval(mins => greatest(p_minutes, 1))
    returning 1)
  select count(*) into v_count from c;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dashboard metrics (single round trip, admin only)
-- ---------------------------------------------------------------------------
create or replace function public.dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'active_products',   count(*) filter (where status = 'published'),
    'draft_products',    count(*) filter (where status = 'draft'),
    'archived_products', count(*) filter (where status = 'archived'),
    'in_stock',          count(*) filter (where status = 'published' and availability = 'in_stock'),
    'low_stock',         count(*) filter (where status = 'published' and availability = 'low_stock'),
    'out_of_stock',      count(*) filter (where status = 'published' and availability = 'out_of_stock'),
    'made_to_order',     count(*) filter (where status = 'published' and availability = 'made_to_order'),
    'categories',        (select count(*) from public.categories),
    'published_categories', (select count(*) from public.categories where is_published),
    'orders_total',      (select count(*) from public.orders),
    'orders_30d',        (select count(*) from public.orders
                           where created_at > now() - interval '30 days' and status <> 'cancelled'),
    'revenue_30d',       (select coalesce(sum(total), 0) from public.orders
                           where created_at > now() - interval '30 days'
                             and status not in ('pending_payment', 'cancelled'))
  ) into v
  from public.products;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants: admin RPCs require a signed-in user (and re-check admin inside);
-- place_order is callable by guests and customers.
-- ---------------------------------------------------------------------------
revoke all on function public.admin_adjust_stock(uuid, uuid, text, integer, text, text) from public;
revoke all on function public.admin_save_product(uuid, jsonb, uuid[], uuid, jsonb, jsonb) from public;
revoke all on function public.admin_duplicate_product(uuid) from public;
revoke all on function public.admin_delete_category(uuid, uuid) from public;
revoke all on function public.admin_reorder_categories(uuid[]) from public;
revoke all on function public.admin_reorder_banners(uuid[]) from public;
revoke all on function public.admin_release_stale_orders(integer) from public;
revoke all on function public.dashboard_stats() from public;
revoke all on function public.place_order(uuid, jsonb, jsonb, numeric, numeric, numeric, text) from public;
revoke all on function public.restock_on_order_cancel() from public;

grant execute on function public.admin_adjust_stock(uuid, uuid, text, integer, text, text) to authenticated;
grant execute on function public.admin_save_product(uuid, jsonb, uuid[], uuid, jsonb, jsonb) to authenticated;
grant execute on function public.admin_duplicate_product(uuid) to authenticated;
grant execute on function public.admin_delete_category(uuid, uuid) to authenticated;
grant execute on function public.admin_reorder_categories(uuid[]) to authenticated;
grant execute on function public.admin_reorder_banners(uuid[]) to authenticated;
grant execute on function public.admin_release_stale_orders(integer) to authenticated;
grant execute on function public.dashboard_stats() to authenticated;
grant execute on function public.place_order(uuid, jsonb, jsonb, numeric, numeric, numeric, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Assign a set of products to a category (atomic replace of that category's membership)
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_category_products(p_category_id uuid, p_product_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ids uuid[] := coalesce(p_product_ids, '{}');
  v_removed uuid[];
begin
  if not private.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  perform 1 from public.categories where id = p_category_id;
  if not found then raise exception 'category_not_found'; end if;

  select array_agg(product_id) into v_removed
    from public.product_categories
   where category_id = p_category_id and not (product_id = any (v_ids));

  delete from public.product_categories
   where category_id = p_category_id and not (product_id = any (v_ids));

  insert into public.product_categories (product_id, category_id, is_primary)
  select pid, p_category_id,
         not exists (select 1 from public.product_categories x where x.product_id = pid and x.is_primary)
    from unnest(v_ids) as pid
   where exists (select 1 from public.products p where p.id = pid)
  on conflict (product_id, category_id) do nothing;

  -- A product that lost its primary category gets another of its categories promoted.
  update public.product_categories pc
     set is_primary = true
   where pc.product_id = any (coalesce(v_removed, '{}'))
     and not exists (select 1 from public.product_categories y where y.product_id = pc.product_id and y.is_primary)
     and pc.category_id = (
       select z.category_id from public.product_categories z
        where z.product_id = pc.product_id order by z.category_id limit 1);
end;
$$;

revoke all on function public.admin_set_category_products(uuid, uuid[]) from public;
grant execute on function public.admin_set_category_products(uuid, uuid[]) to authenticated;


-- >>>>>>>>>>>>>> END OF 20261014000003_functions.sql <<<<<<<<<<<<<<



-- ========================================================
-- POPULATE SEED DATA (CATEGORIES, PRODUCTS, BANNERS)
-- ========================================================

-- GENERATED by scripts/generate-seed.mjs from the legacy hardcoded catalog. Idempotent.
-- Run once, AFTER all migrations. Products are seeded as published, made-to-order (custom
-- printed goods) with inventory tracking off; change this per product in /admin.
begin;

-- categories (parents first)
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('business-cards', 'Visiting Cards', 'Business Cards', 'Letterpress, silk, recycled stock', 'https://images.unsplash.com/photo-1623305465231-d884ce752d59?auto=format&fit=crop&w=600&q=85', 10, true, true, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('apparel', 'Custom Apparel', 'Custom Apparel', 'Tees, hoodies, polos', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=85', 15, true, false, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('stationery', 'Custom Stationery', 'Office Stationery', 'Letterheads, notepads, envelopes', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=85', 110, true, true, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('marketing', 'Marketing Materials', 'Marketing Materials', 'Brochures, flyers, booklets', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=85', 80, true, true, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('stickers', 'Labels & Stickers', 'Stickers & Labels', 'Vinyl, kraft, hologram', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=600&q=85', 90, true, true, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('packaging', 'Packaging', 'Packaging', 'Mailers, boxes, tape', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=600&q=85', 100, true, true, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('gifts', 'Photo Gifts', 'Gifts', 'Mugs, frames, personalised gifts', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=85', 120, true, true, true) on conflict (slug) do nothing;
insert into public.categories (slug, name, nav_label, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('banners', 'Signs & Banners', 'Signs & Banners', 'Vinyl banners, roll-ups, signage', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=85', 130, true, false, true) on conflict (slug) do nothing;
insert into public.categories (slug, parent_id, name, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('polo-t-shirts', (select id from public.categories where slug = 'apparel'), 'Custom Polo T-shirts', 'Embroidered and printed polos', 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?auto=format&fit=crop&w=600&q=85', 20, true, true, false) on conflict (slug) do nothing;
insert into public.categories (slug, parent_id, name, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('dress-shirts', (select id from public.categories where slug = 'apparel'), 'Custom Dress Shirts', 'Formal and business shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=85', 30, true, true, false) on conflict (slug) do nothing;
insert into public.categories (slug, parent_id, name, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('t-shirts', (select id from public.categories where slug = 'apparel'), 'Custom T-shirts', 'Tees, hoodies, polos', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=85', 40, true, true, false) on conflict (slug) do nothing;
insert into public.categories (slug, parent_id, name, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('winter-wear', (select id from public.categories where slug = 'apparel'), 'Custom Winter Wear', 'Hoodies, jackets, sweatshirts', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=85', 50, true, true, false) on conflict (slug) do nothing;
insert into public.categories (slug, parent_id, name, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('stamps-ink', (select id from public.categories where slug = 'stationery'), 'Custom Stamps & Ink', 'Self-inking and rubber stamps', 'https://images.unsplash.com/photo-1586075574641-2f1499cf3751?auto=format&fit=crop&w=600&q=85', 60, true, true, false) on conflict (slug) do nothing;
insert into public.categories (slug, parent_id, name, short_description, image_path, sort_order, is_published, is_featured, show_in_nav) values ('signs-posters', (select id from public.categories where slug = 'marketing'), 'Signs & Posters', 'Fine art and office', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=85', 70, true, true, false) on conflict (slug) do nothing;

-- products
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('standard-business-cards', 'CP-BC-STANDARD', 'Standard Business Cards', '350gsm uncoated stock, sharp colour', 'The workhorse card for teams that hand them out every week. Printed both sides on 350gsm uncoated stock with optional spot UV.', 499, 'published', true, false, false, false, false, true, 0, 'card', '#EEF3FF', 4.8, 2140, '{"sizes":[{"id":"85x55","label":"85 × 55 mm","multiplier":1},{"id":"90x50","label":"90 × 50 mm","multiplier":1.05},{"id":"sq","label":"55 × 55 mm square","multiplier":1.1}],"materials":[{"id":"uncoated","label":"350gsm uncoated","multiplier":1},{"id":"silk","label":"400gsm silk","multiplier":1.25},{"id":"cotton","label":"Cotton letterpress","multiplier":1.8}],"finishes":[{"id":"none","label":"No extra finish","multiplier":1},{"id":"matt","label":"Matt laminate","multiplier":1.15},{"id":"spot","label":"Spot UV","multiplier":1.35}],"quantities":[50,100,250,500,1000,2500]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=900&q=80', 'Standard Business Cards', 0, true from public.products where slug = 'standard-business-cards' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'standard-business-cards' and c.slug = 'business-cards' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('custom-t-shirts', 'CP-TEE-CREW', 'Custom T-shirts', '180gsm combed cotton, DTG print', 'Soft crewnecks with full-front or left-chest print. Colour-managed DTG so brand palettes stay honest across bulk runs.', 399, 'published', true, false, true, false, false, true, 0, 'apparel', '#E8F6EE', 4.7, 1864, '{"sizes":[{"id":"s","label":"S","multiplier":1},{"id":"m","label":"M","multiplier":1},{"id":"l","label":"L","multiplier":1},{"id":"xl","label":"XL","multiplier":1.05},{"id":"xxl","label":"XXL","multiplier":1.1}],"materials":[{"id":"cotton","label":"180gsm cotton","multiplier":1},{"id":"organic","label":"Organic ringspun","multiplier":1.2},{"id":"blend","label":"Tri-blend","multiplier":1.15}],"finishes":[{"id":"dtg","label":"DTG print","multiplier":1},{"id":"screen","label":"Screen print (bulk)","multiplier":0.92},{"id":"embroidery","label":"Embroidery","multiplier":1.4}],"quantities":[1,12,25,50,100,250]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80', 'Custom T-shirts', 0, true from public.products where slug = 'custom-t-shirts' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'custom-t-shirts' and c.slug = 'apparel' on conflict (product_id, category_id) do nothing;
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, false from public.products p, public.categories c where p.slug = 'custom-t-shirts' and c.slug = 't-shirts' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('ceramic-mugs', 'CP-MUG-CERAMIC', 'Ceramic Mugs', '11oz wrap print, dishwasher safe', 'Office mugs that survive the dishwasher. Wrap or front-only print on glazed ceramic with optional gift boxes.', 249, 'published', true, false, false, true, false, true, 0, 'mug', '#FFF4E8', 4.9, 980, '{"sizes":[{"id":"11oz","label":"11 oz","multiplier":1},{"id":"15oz","label":"15 oz","multiplier":1.2}],"materials":[{"id":"white","label":"White ceramic","multiplier":1},{"id":"black","label":"Black ceramic","multiplier":1.1}],"finishes":[{"id":"wrap","label":"Full wrap","multiplier":1},{"id":"front","label":"Front print","multiplier":0.9}],"quantities":[1,12,24,48,96]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80', 'Ceramic Mugs', 0, true from public.products where slug = 'ceramic-mugs' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'ceramic-mugs' and c.slug = 'gifts' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('posters', 'CP-POSTER-A2', 'Posters', '170gsm satin, indoor display', 'Campaign posters with calibrated colour on 170gsm satin. Optional foam board mounting for events.', 199, 'published', true, false, false, false, false, true, 0, 'banner', '#F3EEFF', 4.6, 640, '{"sizes":[{"id":"a3","label":"A3","multiplier":1},{"id":"a2","label":"A2","multiplier":1.6},{"id":"a1","label":"A1","multiplier":2.4}],"materials":[{"id":"satin","label":"170gsm satin","multiplier":1},{"id":"photo","label":"Photo gloss","multiplier":1.2}],"finishes":[{"id":"none","label":"Rolled","multiplier":1},{"id":"board","label":"Foam board","multiplier":1.5}],"quantities":[1,5,10,25,50]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80', 'Posters', 0, true from public.products where slug = 'posters' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'posters' and c.slug = 'marketing' on conflict (product_id, category_id) do nothing;
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, false from public.products p, public.categories c where p.slug = 'posters' and c.slug = 'signs-posters' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('hoodies', 'CP-HOODIE', 'Hoodies', '320gsm fleece, print or embroidery', 'Heavyweight pullovers for merch drops and onboarding kits. Print large across the chest or embroider a small mark.', 799, 'published', true, false, true, false, false, true, 0, 'apparel', '#EEF2FF', 4.8, 512, '{"sizes":[{"id":"m","label":"M","multiplier":1},{"id":"l","label":"L","multiplier":1},{"id":"xl","label":"XL","multiplier":1.08}],"materials":[{"id":"fleece","label":"320gsm fleece","multiplier":1},{"id":"organic","label":"Organic French terry","multiplier":1.25}],"finishes":[{"id":"dtg","label":"DTG print","multiplier":1},{"id":"embroidery","label":"Chest embroidery","multiplier":1.3}],"quantities":[1,10,25,50,100]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=900&q=80', 'Hoodies', 0, true from public.products where slug = 'hoodies' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'hoodies' and c.slug = 'apparel' on conflict (product_id, category_id) do nothing;
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, false from public.products p, public.categories c where p.slug = 'hoodies' and c.slug = 'winter-wear' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('die-cut-stickers', 'CP-STICKER-DIECUT', 'Die-cut Stickers', 'Kiss-cut vinyl, outdoor durable', 'Cut to the shape of your mark. Permanent outdoor vinyl with optional holographic overlay.', 349, 'published', true, false, true, false, false, true, 0, 'sticker', '#EAF7FF', 4.9, 1204, '{"sizes":[{"id":"50","label":"50 mm","multiplier":1},{"id":"75","label":"75 mm","multiplier":1.3},{"id":"100","label":"100 mm","multiplier":1.7}],"materials":[{"id":"vinyl","label":"White vinyl","multiplier":1},{"id":"clear","label":"Clear vinyl","multiplier":1.15},{"id":"holo","label":"Holographic","multiplier":1.45}],"finishes":[{"id":"gloss","label":"Gloss","multiplier":1},{"id":"matt","label":"Matt","multiplier":1.05}],"quantities":[50,100,250,500,1000]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1621252756235-7f37e5e5125e?auto=format&fit=crop&w=900&q=80', 'Die-cut Stickers', 0, true from public.products where slug = 'die-cut-stickers' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'die-cut-stickers' and c.slug = 'stickers' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('flyers', 'CP-FLYER-A5', 'Flyers', '130gsm gloss, fast turnaround', 'Single or double-sided flyers for events and retail. Printed on 130gsm gloss with optional thicker stock.', 599, 'published', false, false, true, false, false, true, 0, 'card', '#FFF0F3', 4.5, 430, '{"sizes":[{"id":"a6","label":"A6","multiplier":0.85},{"id":"a5","label":"A5","multiplier":1},{"id":"a4","label":"A4","multiplier":1.45}],"materials":[{"id":"gloss","label":"130gsm gloss","multiplier":1},{"id":"silk","label":"170gsm silk","multiplier":1.2}],"finishes":[{"id":"ss","label":"Single sided","multiplier":1},{"id":"ds","label":"Double sided","multiplier":1.4}],"quantities":[100,250,500,1000,2500]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80', 'Flyers', 0, true from public.products where slug = 'flyers' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'flyers' and c.slug = 'marketing' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('brochures', 'CP-BROCHURE', 'Brochures', 'Folded 170gsm, saddle stitch optional', 'Bi-fold and tri-fold brochures with tight registration. Add saddle-stitched booklets for longer stories.', 899, 'published', false, false, false, false, false, true, 0, 'card', '#F0F7FF', 4.7, 288, '{"sizes":[{"id":"a5","label":"A5 bi-fold","multiplier":1},{"id":"a4","label":"A4 tri-fold","multiplier":1.5}],"materials":[{"id":"silk","label":"170gsm silk","multiplier":1},{"id":"uncoated","label":"Uncoated writing","multiplier":1.1}],"finishes":[{"id":"fold","label":"Folded","multiplier":1},{"id":"stitch","label":"Saddle stitch","multiplier":1.35}],"quantities":[50,100,250,500]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80', 'Brochures', 0, true from public.products where slug = 'brochures' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'brochures' and c.slug = 'marketing' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('branded-mailers', 'CP-MAILER', 'Branded Mailer Boxes', 'E-flute, inside and outside print', 'Rigid mailers that unbox like a product launch. Print outside, inside, or both, with optional tissue wrap.', 1299, 'published', false, false, true, false, false, true, 0, 'packaging', '#FFF7ED', 4.8, 176, '{"sizes":[{"id":"s","label":"Small 20×12×8 cm","multiplier":1},{"id":"m","label":"Medium 30×20×10 cm","multiplier":1.4},{"id":"l","label":"Large 40×30×12 cm","multiplier":1.9}],"materials":[{"id":"white","label":"White e-flute","multiplier":1},{"id":"kraft","label":"Kraft e-flute","multiplier":0.95}],"finishes":[{"id":"out","label":"Outside print","multiplier":1},{"id":"both","label":"Inside + outside","multiplier":1.45}],"quantities":[25,50,100,250,500]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80', 'Branded Mailer Boxes', 0, true from public.products where slug = 'branded-mailers' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'branded-mailers' and c.slug = 'packaging' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('canvas-totes', 'CP-TOTE', 'Canvas Tote Bags', '12oz cotton canvas', 'Reusable totes for events and retail. Screen print or DTG on natural or dyed canvas.', 349, 'published', false, false, true, true, false, true, 0, 'apparel', '#F3F0FF', 4.6, 390, '{"sizes":[{"id":"std","label":"38 × 42 cm","multiplier":1}],"materials":[{"id":"natural","label":"Natural canvas","multiplier":1},{"id":"black","label":"Black canvas","multiplier":1.08}],"finishes":[{"id":"1c","label":"1 colour screen","multiplier":1},{"id":"dtg","label":"Full colour DTG","multiplier":1.35}],"quantities":[10,25,50,100,250]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1597484661643-2d57e7a3aca6?auto=format&fit=crop&w=900&q=80', 'Canvas Tote Bags', 0, true from public.products where slug = 'canvas-totes' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'canvas-totes' and c.slug = 'apparel' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('caps', 'CP-CAP', 'Caps', 'Structured 6-panel, embroidered', 'Structured cotton caps with 3D puff or flat embroidery. Adjustable strap, retail-ready.', 449, 'published', false, false, true, false, false, true, 0, 'apparel', '#EEF6FF', 4.7, 221, '{"sizes":[{"id":"os","label":"One size","multiplier":1}],"materials":[{"id":"cotton","label":"Cotton twill","multiplier":1},{"id":"wool","label":"Melton wool","multiplier":1.3}],"finishes":[{"id":"flat","label":"Flat embroidery","multiplier":1},{"id":"puff","label":"3D puff","multiplier":1.25}],"quantities":[12,24,48,96]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1521369909029-2a9559c67a1c?auto=format&fit=crop&w=900&q=80', 'Caps', 0, true from public.products where slug = 'caps' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'caps' and c.slug = 'apparel' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('branded-notebooks', 'CP-NOTEBOOK', 'Branded Notebooks', 'A5 layflat, foil option', 'Layflat A5 notebooks with printed covers and optional foil. Lined, dotted, or blank interiors.', 279, 'published', false, false, false, true, false, true, 0, 'card', '#F4F1EA', 4.8, 154, '{"sizes":[{"id":"a6","label":"A6","multiplier":0.85},{"id":"a5","label":"A5","multiplier":1}],"materials":[{"id":"soft","label":"Softcover","multiplier":1},{"id":"hard","label":"Hardcover","multiplier":1.4}],"finishes":[{"id":"print","label":"Full colour print","multiplier":1},{"id":"foil","label":"Foil stamp","multiplier":1.3}],"quantities":[25,50,100,250]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80', 'Branded Notebooks', 0, true from public.products where slug = 'branded-notebooks' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'branded-notebooks' and c.slug = 'stationery' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('steel-bottles', 'CP-BOTTLE', 'Steel Water Bottles', '500ml powder-coated steel', 'Double-wall bottles with wrap print or engraved marks. Keeps water cold through a long site visit.', 599, 'published', false, false, true, true, false, true, 0, 'mug', '#E8F4FF', 4.7, 198, '{"sizes":[{"id":"500","label":"500 ml","multiplier":1},{"id":"750","label":"750 ml","multiplier":1.2}],"materials":[{"id":"white","label":"White powder coat","multiplier":1},{"id":"navy","label":"Navy powder coat","multiplier":1}],"finishes":[{"id":"print","label":"Wrap print","multiplier":1},{"id":"engrave","label":"Laser engrave","multiplier":1.2}],"quantities":[12,24,48,96]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80', 'Steel Water Bottles', 0, true from public.products where slug = 'steel-bottles' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'steel-bottles' and c.slug = 'gifts' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('vinyl-banners', 'CP-BANNER-VINYL', 'Vinyl Banners', '13oz outdoor vinyl, hemmed', 'Weathered-tested outdoor banners with brass eyelets. Indoor fabric option for exhibitions.', 899, 'published', false, false, true, false, false, true, 0, 'banner', '#EEF2FF', 4.6, 142, '{"sizes":[{"id":"3x2","label":"3 × 2 ft","multiplier":1},{"id":"6x3","label":"6 × 3 ft","multiplier":1.8},{"id":"8x4","label":"8 × 4 ft","multiplier":2.4}],"materials":[{"id":"vinyl","label":"13oz vinyl","multiplier":1},{"id":"fabric","label":"Indoor fabric","multiplier":1.15}],"finishes":[{"id":"hem","label":"Hem + eyelets","multiplier":1},{"id":"pole","label":"Pole pockets","multiplier":1.2}],"quantities":[1,2,5,10]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80', 'Vinyl Banners', 0, true from public.products where slug = 'vinyl-banners' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'vinyl-banners' and c.slug = 'banners' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('lanyards', 'CP-LANYARD', 'Event Lanyards', '20mm polyester, dye-sub', 'Full-colour dye-sub lanyards for conferences. Breakaway clips and badge reels available.', 199, 'published', false, false, false, true, false, true, 0, 'sticker', '#F0F9FF', 4.5, 87, '{"sizes":[{"id":"20","label":"20 mm width","multiplier":1}],"materials":[{"id":"poly","label":"Polyester","multiplier":1}],"finishes":[{"id":"clip","label":"Trigger clip","multiplier":1},{"id":"reel","label":"Badge reel","multiplier":1.2}],"quantities":[50,100,250,500]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=900&q=80', 'Event Lanyards', 0, true from public.products where slug = 'lanyards' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'lanyards' and c.slug = 'gifts' on conflict (product_id, category_id) do nothing;
insert into public.products (slug, sku, name, tagline, description, price, status, is_featured, is_bestseller, is_trending, is_new, track_inventory, made_to_order, stock_quantity, editor_preset, accent, rating, review_count, print_options) values ('polo-shirts', 'CP-POLO', 'Polo Shirts', 'Pique cotton, left-chest mark', 'Uniform polos with embroidered or printed marks. Colour-matched collars for brand kits.', 549, 'published', false, false, false, true, false, true, 0, 'apparel', '#ECFDF3', 4.6, 133, '{"sizes":[{"id":"m","label":"M","multiplier":1},{"id":"l","label":"L","multiplier":1},{"id":"xl","label":"XL","multiplier":1.06}],"materials":[{"id":"pique","label":"Pique cotton","multiplier":1},{"id":"perf","label":"Performance knit","multiplier":1.18}],"finishes":[{"id":"emb","label":"Left-chest embroidery","multiplier":1},{"id":"print","label":"DTG print","multiplier":0.95}],"quantities":[6,12,25,50,100]}'::jsonb) on conflict (slug) do nothing;
insert into public.product_images (product_id, path, alt, sort_order, is_primary) select id, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80', 'Polo Shirts', 0, true from public.products where slug = 'polo-shirts' and not exists (select 1 from public.product_images i where i.product_id = products.id);
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, true from public.products p, public.categories c where p.slug = 'polo-shirts' and c.slug = 'apparel' on conflict (product_id, category_id) do nothing;
insert into public.product_categories (product_id, category_id, is_primary) select p.id, c.id, false from public.products p, public.categories c where p.slug = 'polo-shirts' and c.slug = 'polo-t-shirts' on conflict (product_id, category_id) do nothing;

-- banners (only seeded when the table is empty, so re-running never duplicates them)
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_hero', '₹300 off orders ₹2,499+ | ₹150 off orders ₹1,499+', 'Festival Savings: Buy More, Save More', 'Whatever your business needs this festive season, enjoy savings across the site.', 'Visiting Cards', '/catalog?category=business-cards', null, '{"gradient":"from-[#297b8a] via-[#74876b] to-[#e48332]","code":"BMSM","validUntil":"Ends Oct. 20","watermark":"BUY MORE, SAVE MORE","ctas":[{"label":"Visiting Cards","to":"/catalog?category=business-cards","primary":true},{"label":"Business Essentials","to":"/catalog?category=marketing"},{"label":"Winterwear","to":"/catalog?category=apparel"}]}'::jsonb, 10, 'published' where not exists (select 1 from public.banners);
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_hero', 'Flat 20% Off Your First Custom Print Order', 'First Order Special', 'Premium cardstock, sharp color reproduction, and express doorstep delivery across India.', 'Standard Cards', '/catalog?category=business-cards', null, '{"gradient":"from-[#1d3557] via-[#2a6f97] to-[#468faf]","code":"WELCOME20","validUntil":"Limited Time Offer","watermark":"PRINT WITH PRIDE","ctas":[{"label":"Standard Cards","to":"/catalog?category=business-cards","primary":true},{"label":"Stickers & Labels","to":"/catalog?category=stickers"},{"label":"Branded Boxes","to":"/catalog?category=packaging"}]}'::jsonb, 20, 'published' where not exists (select 1 from public.banners);
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_hero', 'Save Up to 35% on Custom Hoodies & Winterwear', 'Team & Corporate Special', 'Outfit your team with warm fleece hoodies, premium embroidery, and custom screen prints.', 'Custom Hoodies', '/catalog?q=hoodie', null, '{"gradient":"from-[#3c1361] via-[#522258] to-[#b83b5e]","code":"WINTER35","validUntil":"Ends Oct. 25","watermark":"WEAR YOUR BRAND","ctas":[{"label":"Custom Hoodies","to":"/catalog?q=hoodie","primary":true},{"label":"Polo T-shirts","to":"/catalog?q=polo"},{"label":"Caps & Beanies","to":"/catalog?category=apparel"}]}'::jsonb, 30, 'published' where not exists (select 1 from public.banners);
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_promo_top', 'Make a lasting first impression', 'Business Cards', 'Premium finishes. A memorable first impression.', 'Shop Business Cards', '/catalog?category=business-cards', '/images/calcuttapress-business-cards.svg', '{"tone":"from-[#fff0e7] to-[#ffdfcf]","dark":false}'::jsonb, 10, 'published' where not exists (select 1 from public.banners);
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_promo_top', 'Wear your brand proudly', 'Custom Apparel', 'Wear your story with standout custom prints.', 'Shop Apparel', '/catalog?category=apparel', '/images/calcuttapress-custom-apparel.svg', '{"tone":"from-[#e6f9dc] to-[#c9f1b9]","dark":false}'::jsonb, 20, 'published' where not exists (select 1 from public.banners);
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_promo_bottom', 'Small Details. Big Impact.', 'Stickers & Labels', 'Make your brand impossible to miss.', 'Shop Stickers', '/catalog?category=stickers', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=85', '{"tone":"from-[#102748] to-[#183c69]","dark":true}'::jsonb, 10, 'published' where not exists (select 1 from public.banners);
insert into public.banners (placement, title, subtitle, description, cta_label, cta_url, desktop_image_path, theme, sort_order, status) select 'home_promo_bottom', 'Custom Packaging for Your Brand', 'Packaging & Boxes', 'Make your brand impossible to miss.', 'Shop Packaging', '/catalog?category=packaging', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=85', '{"tone":"from-[#f0f3fa] to-[#e4eafa]","dark":false}'::jsonb, 20, 'published' where not exists (select 1 from public.banners);

-- site settings
insert into public.site_settings (key, value) values ('store', '{"name":"Calcuttapress","tagline":"Premium custom printing","supportEmail":"","supportPhone":""}'::jsonb) on conflict (key) do nothing;
insert into public.site_settings (key, value) values ('announcement', '{"enabled":true,"text":"Festival Savings: Flat ₹300 off ₹2,499+ or ₹150 off ₹1,499+","code":"BMSM","validUntil":"Ends Oct. 20","linkTo":"/catalog"}'::jsonb) on conflict (key) do nothing;
insert into public.site_settings (key, value) values ('shipping', '{"freeThreshold":2500,"flatFee":149}'::jsonb) on conflict (key) do nothing;
insert into public.site_settings (key, value) values ('social', '{"instagram":"","linkedin":"","youtube":""}'::jsonb) on conflict (key) do nothing;

commit;

