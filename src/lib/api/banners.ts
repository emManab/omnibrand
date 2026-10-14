import { requireSupabase } from "@/lib/supabase";
import { mapBanner } from "@/lib/api/mappers";
import { removeStorageObjects } from "@/lib/api/storage";
import type { Banner, BannerPlacement, BannerTheme, PublishStatus } from "@/types";

type Row = Record<string, unknown>;
const COLS = "*,product:products(slug),category:categories(slug)";

/** Storefront: published banners that are inside their schedule window, optionally per placement. */
export async function listLiveBanners(placement?: BannerPlacement): Promise<Banner[]> {
  const nowIso = new Date().toISOString();
  let query = requireSupabase()
    .from("banners")
    .select(COLS)
    .eq("status", "published")
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (placement) query = query.eq("placement", placement);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map(mapBanner);
}

/** Admin: all banners regardless of status. */
export async function listAllBanners(): Promise<Banner[]> {
  const { data, error } = await requireSupabase()
    .from("banners")
    .select(COLS)
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map(mapBanner);
}

export type BannerInput = {
  id?: string;
  placement: BannerPlacement;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  productId: string | null;
  categoryId: string | null;
  desktopImagePath: string;
  mobileImagePath: string;
  theme: BannerTheme;
  status: PublishStatus;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder?: number;
};

export async function saveBanner(input: BannerInput): Promise<string> {
  const sb = requireSupabase();
  const row = {
    placement: input.placement,
    title: input.title.trim(),
    subtitle: input.subtitle || null,
    description: input.description || null,
    cta_label: input.ctaLabel || null,
    cta_url: input.ctaUrl || null,
    product_id: input.productId,
    category_id: input.categoryId,
    desktop_image_path: input.desktopImagePath || null,
    mobile_image_path: input.mobileImagePath || null,
    theme: input.theme,
    status: input.status,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
  };
  if (input.id) {
    const { error } = await sb.from("banners").update(row).eq("id", input.id);
    if (error) throw error;
    return input.id;
  }
  const { data: last } = await sb
    .from("banners")
    .select("sort_order")
    .eq("placement", input.placement)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = input.sortOrder ?? (Number((last as Row | null)?.sort_order ?? 0) + 10);
  const { data, error } = await sb.from("banners").insert({ ...row, sort_order: sort }).select("id").single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function setBannerStatus(id: string, status: PublishStatus): Promise<void> {
  const { error } = await requireSupabase().from("banners").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteBanner(banner: Pick<Banner, "id" | "desktopImagePath" | "mobileImagePath">) {
  const sb = requireSupabase();
  const { error } = await sb.from("banners").delete().eq("id", banner.id);
  if (error) throw error;
  // Only remove files no other banner still points at.
  const paths = [banner.desktopImagePath, banner.mobileImagePath].filter(Boolean);
  if (!paths.length) return;
  const { data } = await sb
    .from("banners")
    .select("desktop_image_path,mobile_image_path")
    .or(paths.map((p) => `desktop_image_path.eq.${p},mobile_image_path.eq.${p}`).join(","));
  const used = new Set(
    ((data ?? []) as Row[]).flatMap((r) => [String(r.desktop_image_path ?? ""), String(r.mobile_image_path ?? "")]),
  );
  await removeStorageObjects(paths.filter((p) => !used.has(p)));
}

export async function reorderBanners(orderedIds: string[]): Promise<void> {
  const { error } = await requireSupabase().rpc("admin_reorder_banners", { p_ids: orderedIds });
  if (error) throw error;
}
