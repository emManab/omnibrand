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
