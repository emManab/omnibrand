import { requireSupabase } from "@/lib/supabase";
import { mapCategory } from "@/lib/api/mappers";
import { removeStorageObjects } from "@/lib/api/storage";

type Row = Record<string, unknown>;

/** Public storefront: published categories only. Admin: everything, with product counts. */
export async function listCategories(opts: { admin?: boolean } = {}) {
  const sb = requireSupabase();
  let query = sb
    .from("categories")
    .select(opts.admin ? "*,product_categories(count)" : "*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (!opts.admin) query = query.eq("is_published", true);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map(mapCategory);
}

export type CategoryInput = {
  id?: string;
  parentId: string | null;
  slug: string;
  name: string;
  navLabel: string;
  shortDescription: string;
  description: string;
  imagePath: string;
  sortOrder?: number;
  isPublished: boolean;
  isFeatured: boolean;
  showInNav: boolean;
  seoTitle: string;
  seoDescription: string;
};

export async function saveCategory(input: CategoryInput): Promise<string> {
  const sb = requireSupabase();
  const row = {
    parent_id: input.parentId,
    slug: input.slug,
    name: input.name.trim(),
    nav_label: input.navLabel.trim() || null,
    short_description: input.shortDescription || null,
    description: input.description || null,
    image_path: input.imagePath || null,
    is_published: input.isPublished,
    is_featured: input.isFeatured,
    show_in_nav: input.showInNav,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
  };
  if (input.id) {
    const { error } = await sb.from("categories").update(row).eq("id", input.id);
    if (error) throw error;
    return input.id;
  }
  // New categories go to the end of the list.
  const { data: last } = await sb
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = input.sortOrder ?? (Number((last as Row | null)?.sort_order ?? 0) + 10);
  const { data, error } = await sb
    .from("categories")
    .insert({ ...row, sort_order: sort })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function setCategoryFlag(
  id: string,
  flag: "is_published" | "is_featured" | "show_in_nav",
  value: boolean,
): Promise<void> {
  const { error } = await requireSupabase().from("categories").update({ [flag]: value }).eq("id", id);
  if (error) throw error;
}

/** Deletes a category. Fails (by design) while it has products unless `reassignTo` is given. */
export async function deleteCategory(id: string, imagePath: string, reassignTo: string | null) {
  const { error } = await requireSupabase().rpc("admin_delete_category", {
    p_id: id,
    p_reassign_to: reassignTo,
  });
  if (error) throw error;
  await removeStorageObjects([imagePath]);
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const { error } = await requireSupabase().rpc("admin_reorder_categories", { p_ids: orderedIds });
  if (error) throw error;
}

/** Replaces the set of products assigned to a category (atomic). */
export async function setCategoryProducts(categoryId: string, productIds: string[]): Promise<void> {
  const { error } = await requireSupabase().rpc("admin_set_category_products", {
    p_category_id: categoryId,
    p_product_ids: productIds,
  });
  if (error) throw error;
}

export async function listCategoryProductIds(categoryId: string): Promise<string[]> {
  const { data, error } = await requireSupabase()
    .from("product_categories")
    .select("product_id")
    .eq("category_id", categoryId);
  if (error) throw error;
  return ((data ?? []) as { product_id: string }[]).map((r) => r.product_id);
}
