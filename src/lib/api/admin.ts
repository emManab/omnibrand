import { requireSupabase } from "@/lib/supabase";
import type { DashboardStats, SiteSettings } from "@/types";

type Row = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export const DEFAULT_SETTINGS: SiteSettings = {
  store: { name: "Calcuttapress", tagline: "Premium custom printing", supportEmail: "", supportPhone: "" },
  announcement: { enabled: false, text: "", code: "", validUntil: "", linkTo: "/catalog" },
  shipping: { freeThreshold: 2500, flatFee: 149 },
  social: { instagram: "", linkedin: "", youtube: "" },
};

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await requireSupabase().from("site_settings").select("key,value");
  if (error) throw error;
  const merged: SiteSettings = structuredClone(DEFAULT_SETTINGS);
  for (const row of (data ?? []) as { key: keyof SiteSettings; value: Record<string, unknown> }[]) {
    if (row.key in merged) {
      (merged[row.key] as Record<string, unknown>) = { ...merged[row.key], ...row.value };
    }
  }
  return merged;
}

export async function saveSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]): Promise<void> {
  const sb = requireSupabase();
  const { data: auth } = await sb.auth.getUser();
  const { error } = await sb
    .from("site_settings")
    .upsert({ key, value, updated_by: auth.user?.id ?? null }, { onConflict: "key" });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await requireSupabase().rpc("dashboard_stats");
  if (error) throw error;
  const r = data as Record<string, number>;
  return {
    activeProducts: Number(r.active_products ?? 0),
    draftProducts: Number(r.draft_products ?? 0),
    archivedProducts: Number(r.archived_products ?? 0),
    inStock: Number(r.in_stock ?? 0),
    lowStock: Number(r.low_stock ?? 0),
    outOfStock: Number(r.out_of_stock ?? 0),
    madeToOrder: Number(r.made_to_order ?? 0),
    categories: Number(r.categories ?? 0),
    publishedCategories: Number(r.published_categories ?? 0),
    ordersTotal: Number(r.orders_total ?? 0),
    orders30d: Number(r.orders_30d ?? 0),
    revenue30d: Number(r.revenue_30d ?? 0),
  };
}

export type RecentProduct = { id: string; name: string; slug: string; status: string; updatedAt: string };

export async function listRecentlyUpdatedProducts(limit = 6): Promise<RecentProduct[]> {
  const { data, error } = await requireSupabase()
    .from("products")
    .select("id,name,slug,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as Row[]).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    status: String(r.status),
    updatedAt: String(r.updated_at),
  }));
}

// ---------------------------------------------------------------------------
// Customers (read-only) and the signed-in admin's profile
// ---------------------------------------------------------------------------
export type CustomerRow = {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
  orders: number;
  spent: number;
};

export async function listCustomers(opts: { page?: number; pageSize?: number; search?: string } = {}) {
  const sb = requireSupabase();
  const size = opts.pageSize ?? 20;
  const page = opts.page ?? 0;
  let query = sb
    .from("profiles")
    .select("id,email,full_name,created_at", { count: "exact" })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(page * size, page * size + size - 1);
  const term = (opts.search ?? "").replace(/[,()%*_\\"']/g, " ").trim();
  if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  const ids = rows.map((r) => String(r.id));
  const totals = new Map<string, { orders: number; spent: number }>();
  if (ids.length) {
    const { data: orders, error: oe } = await sb
      .from("orders")
      .select("user_id,total,status")
      .in("user_id", ids);
    if (oe) throw oe;
    for (const o of (orders ?? []) as Row[]) {
      if (o.status === "cancelled") continue;
      const t = totals.get(String(o.user_id)) ?? { orders: 0, spent: 0 };
      t.orders += 1;
      if (o.status !== "pending_payment") t.spent += Number(o.total ?? 0);
      totals.set(String(o.user_id), t);
    }
  }
  const items: CustomerRow[] = rows.map((r) => ({
    id: String(r.id),
    email: String(r.email ?? ""),
    name: String(r.full_name ?? ""),
    joinedAt: String(r.created_at),
    orders: totals.get(String(r.id))?.orders ?? 0,
    spent: totals.get(String(r.id))?.spent ?? 0,
  }));
  return { items, total: count ?? items.length };
}

export type AdminProfile = { id: string; email: string; fullName: string; avatarPath: string };

export async function getMyProfile(): Promise<AdminProfile | null> {
  const sb = requireSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id,email,full_name,avatar_path")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  const r = (data ?? {}) as Row;
  return {
    id: auth.user.id,
    email: auth.user.email ?? String(r.email ?? ""),
    fullName: String(r.full_name ?? ""),
    avatarPath: String(r.avatar_path ?? ""),
  };
}

export async function updateMyProfile(patch: { fullName?: string; avatarPath?: string }): Promise<void> {
  const sb = requireSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("You are signed out.");
  const row: Record<string, unknown> = {};
  if (patch.fullName !== undefined) row.full_name = patch.fullName.trim();
  if (patch.avatarPath !== undefined) row.avatar_path = patch.avatarPath || null;
  const { error } = await sb.from("profiles").update(row).eq("id", auth.user.id);
  if (error) throw error;
}

export async function changeMyPassword(newPassword: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });
  if (error) throw error;
}

export async function releaseStaleOrders(minutes = 60): Promise<number> {
  const { data, error } = await requireSupabase().rpc("admin_release_stale_orders", { p_minutes: minutes });
  if (error) throw error;
  return Number(data ?? 0);
}
