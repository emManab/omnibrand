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
