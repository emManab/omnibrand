import { requireSupabase } from "@/lib/supabase";
import { mediaUrl, splitStoragePath } from "@/lib/media";
import { mapProduct, PRODUCT_DETAIL_COLS, PRODUCT_LIST_COLS } from "@/lib/api/mappers";
import { removeStorageObjects } from "@/lib/api/storage";
import type {
  Availability,
  EditorPreset,
  InventoryMovement,
  PrintOptions,
  Product,
  PublishStatus,
} from "@/types";

type Row = Record<string, unknown>;

export type ProductSort =
  | "recommended"
  | "price"
  | "price_desc"
  | "newest"
  | "name"
  | "updated"
  | "stock";

export type ProductQuery = {
  /** Match products in ANY of these categories (use category + its descendants). */
  categoryIds?: string[];
  search?: string;
  flag?: "featured" | "bestseller" | "trending" | "new";
  sort?: ProductSort;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  /** Convenience for rails: first N rows, no count. */
  limit?: number;
  ids?: string[];
  /** Admin lists ignore the published-only filter. */
  admin?: boolean;
  status?: PublishStatus | "all";
  availability?: Availability;
};

/** Strips characters that would break a PostgREST `or=` filter or act as LIKE wildcards. */
export function sanitizeSearch(input: string): string {
  return input.replace(/[,()%*_\\"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function listProducts(q: ProductQuery = {}): Promise<{ items: Product[]; total: number }> {
  const sb = requireSupabase();
  const filterByCategory = Boolean(q.categoryIds?.length);
  const cols = filterByCategory
    ? `${PRODUCT_LIST_COLS},cat_filter:product_categories!inner(category_id)`
    : PRODUCT_LIST_COLS;

  let query = sb.from("products").select(cols, { count: "exact" });

  if (!q.admin) query = query.eq("status", "published");
  else if (q.status && q.status !== "all") query = query.eq("status", q.status);

  if (q.availability) query = query.eq("availability", q.availability);
  if (filterByCategory) query = query.in("cat_filter.category_id", q.categoryIds!);
  if (q.ids) query = query.in("id", q.ids.length ? q.ids : ["00000000-0000-0000-0000-000000000000"]);

  if (q.flag === "featured") query = query.eq("is_featured", true);
  if (q.flag === "bestseller") query = query.eq("is_bestseller", true);
  if (q.flag === "trending") query = query.eq("is_trending", true);
  if (q.flag === "new") query = query.eq("is_new", true);
  if (q.maxPrice !== undefined) query = query.lt("price", q.maxPrice);

  const term = sanitizeSearch(q.search ?? "");
  if (term) {
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,tagline.ilike.%${term}%`);
  }

  switch (q.sort ?? "recommended") {
    case "price":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "updated":
      query = query.order("updated_at", { ascending: false });
      break;
    case "stock":
      query = query.order("stock_quantity", { ascending: true });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }
  query = query.order("id", { ascending: true }); // stable pagination

  if (q.limit) {
    query = query.limit(q.limit);
  } else if (q.page !== undefined) {
    const size = q.pageSize ?? 24;
    query = query.range(q.page * size, q.page * size + size - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  const items = ((data ?? []) as unknown as Row[]).map(mapProduct);
  return { items, total: count ?? items.length };
}

export async function getProductBySlug(slug: string, opts: { preview?: boolean } = {}): Promise<Product | null> {
  const sb = requireSupabase();
  let query = sb.from("products").select(PRODUCT_DETAIL_COLS).eq("slug", slug);
  if (!opts.preview) query = query.eq("status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as Row) : null;
}

export async function getProductById(id: string, opts: { preview?: boolean } = {}): Promise<Product | null> {
  const sb = requireSupabase();
  let query = sb.from("products").select(PRODUCT_DETAIL_COLS).eq("id", id);
  if (!opts.preview) query = query.eq("status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as Row) : null;
}

// ---------------------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------------------
export type ProductInput = {
  id?: string;
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  salePrice: number | null;
  status: PublishStatus;
  featured: boolean;
  bestseller: boolean;
  trending: boolean;
  newArrival: boolean;
  trackInventory: boolean;
  madeToOrder: boolean;
  stock: number;
  lowStockThreshold: number;
  editorPreset: EditorPreset;
  accent: string;
  rating: number;
  reviews: number;
  printOptions: PrintOptions;
  seoTitle: string;
  seoDescription: string;
  categoryIds: string[];
  primaryCategoryId: string | null;
  images: { id?: string; path: string; alt: string; sortOrder: number; isPrimary: boolean }[];
  variants: {
    id?: string;
    name: string;
    sku: string;
    optionValues: Record<string, string>;
    priceDelta: number;
    stockQuantity: number;
    isActive: boolean;
    sortOrder: number;
  }[];
};

/** Saves a product and its categories / gallery / variants in ONE database transaction. */
export async function saveProduct(input: ProductInput): Promise<string> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("admin_save_product", {
    p_id: input.id ?? null,
    p_product: {
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      price: input.price,
      sale_price: input.salePrice,
      status: input.status,
      is_featured: input.featured,
      is_bestseller: input.bestseller,
      is_trending: input.trending,
      is_new: input.newArrival,
      track_inventory: input.trackInventory,
      made_to_order: input.madeToOrder,
      stock_quantity: input.stock,
      low_stock_threshold: input.lowStockThreshold,
      editor_preset: input.editorPreset,
      accent: input.accent,
      rating: input.rating,
      review_count: input.reviews,
      print_options: input.printOptions,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
    },
    p_category_ids: input.categoryIds,
    p_primary_category: input.primaryCategoryId,
    p_images: input.images.map((i) => ({
      id: i.id ?? null,
      path: i.path,
      alt: i.alt,
      sort_order: i.sortOrder,
      is_primary: i.isPrimary,
    })),
    p_variants: input.variants.map((v) => ({
      id: v.id ?? null,
      name: v.name,
      sku: v.sku,
      option_values: v.optionValues,
      price_delta: v.priceDelta,
      stock_quantity: v.stockQuantity,
      is_active: v.isActive,
      sort_order: v.sortOrder,
    })),
  });
  if (error) throw error;
  return data as string;
}

export async function duplicateProduct(id: string): Promise<string> {
  const { data, error } = await requireSupabase().rpc("admin_duplicate_product", { p_id: id });
  if (error) throw error;
  return data as string;
}

export async function setProductsStatus(ids: string[], status: PublishStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await requireSupabase().from("products").update({ status }).in("id", ids);
  if (error) throw error;
}

export async function setProductFlag(
  id: string,
  flag: "is_featured" | "is_bestseller" | "is_trending" | "is_new",
  value: boolean,
): Promise<void> {
  const { error } = await requireSupabase().from("products").update({ [flag]: value }).eq("id", id);
  if (error) throw error;
}

export async function updateInventorySettings(
  id: string,
  patch: { low_stock_threshold?: number; track_inventory?: boolean; made_to_order?: boolean },
): Promise<void> {
  const { error } = await requireSupabase().from("products").update(patch).eq("id", id);
  if (error) throw error;
}

/** Deletes a product, then removes gallery files that no other product still uses. */
export async function deleteProduct(id: string): Promise<void> {
  const sb = requireSupabase();
  const { data: imgs, error: e1 } = await sb.from("product_images").select("path").eq("product_id", id);
  if (e1) throw e1;
  const paths = ((imgs ?? []) as { path: string }[]).map((i) => i.path);
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw error;
  await cleanupUnreferencedImages(paths);
}

/** Removes storage objects that no product_images row references any more (best effort). */
export async function cleanupUnreferencedImages(paths: string[]): Promise<void> {
  const storagePaths = [...new Set(paths)].filter((p) => splitStoragePath(p));
  if (!storagePaths.length) return;
  const sb = requireSupabase();
  const { data } = await sb.from("product_images").select("path").in("path", storagePaths);
  const stillUsed = new Set(((data ?? []) as { path: string }[]).map((r) => r.path));
  await removeStorageObjects(storagePaths.filter((p) => !stillUsed.has(p)));
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
export async function adjustStock(args: {
  productId: string;
  variantId?: string | null;
  mode: "delta" | "set";
  amount: number;
  reason: string;
  note?: string;
}): Promise<{ quantityAfter: number; delta: number }> {
  const { data, error } = await requireSupabase().rpc("admin_adjust_stock", {
    p_product_id: args.productId,
    p_variant_id: args.variantId ?? null,
    p_mode: args.mode,
    p_amount: Math.trunc(args.amount),
    p_reason: args.reason,
    p_note: args.note ?? null,
  });
  if (error) throw error;
  const r = data as { quantity_after: number; delta: number };
  return { quantityAfter: r.quantity_after, delta: r.delta };
}

export async function listMovements(opts: {
  productId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: InventoryMovement[]; total: number }> {
  const size = opts.pageSize ?? 20;
  const page = opts.page ?? 0;
  let query = requireSupabase()
    .from("inventory_movements")
    .select("id,product_id,variant_id,delta,quantity_after,reason,note,created_at,product:products(name,sku)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(page * size, page * size + size - 1);
  if (opts.productId) query = query.eq("product_id", opts.productId);
  const { data, error, count } = await query;
  if (error) throw error;
  const items = ((data ?? []) as unknown as Row[]).map((r) => {
    const p = r.product as { name?: string; sku?: string } | null;
    return {
      id: Number(r.id),
      productId: String(r.product_id),
      productName: p?.name ?? "(deleted product)",
      productSku: p?.sku ?? "",
      variantId: r.variant_id ? String(r.variant_id) : null,
      delta: Number(r.delta),
      quantityAfter: Number(r.quantity_after),
      reason: String(r.reason ?? ""),
      note: String(r.note ?? ""),
      createdAt: String(r.created_at),
    } satisfies InventoryMovement;
  });
  return { items, total: count ?? items.length };
}

export { mediaUrl };
