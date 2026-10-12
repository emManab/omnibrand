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
