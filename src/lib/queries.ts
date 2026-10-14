import { useEffect } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { listProducts, getProductBySlug, type ProductQuery } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { listLiveBanners } from "@/lib/api/banners";
import { getSettings, DEFAULT_SETTINGS } from "@/lib/api/admin";
import type { BannerPlacement } from "@/types";

/** Public storefront data is fresh for 30s and also pushed via Realtime (see below). */
const STALE = 30_000;

export function useCategories() {
  return useQuery({
    queryKey: ["categories", "public"],
    queryFn: () => listCategories(),
    enabled: supabaseEnabled,
    staleTime: STALE,
  });
}

export function useProducts(q: ProductQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["products", "list", q],
    queryFn: () => listProducts(q),
    enabled: supabaseEnabled && (opts.enabled ?? true),
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string | undefined, preview = false) {
  return useQuery({
    queryKey: ["products", "detail", slug, preview],
    queryFn: () => getProductBySlug(slug ?? "", { preview }),
    enabled: supabaseEnabled && Boolean(slug),
    staleTime: preview ? 0 : STALE,
  });
}

export function useBanners(placement?: BannerPlacement) {
  return useQuery({
    queryKey: ["banners", "public", placement ?? "all"],
    queryFn: () => listLiveBanners(placement),
    enabled: supabaseEnabled,
    staleTime: STALE,
  });
}

export function useSettings() {
  const query = useQuery({
    queryKey: ["settings", "public"],
    queryFn: getSettings,
    enabled: supabaseEnabled,
    staleTime: STALE,
  });
  return { ...query, settings: query.data ?? DEFAULT_SETTINGS };
}

/** Invalidate everything that depends on catalog content (storefront AND admin views). */
export function invalidateContent(qc: QueryClient) {
  for (const key of ["products", "categories", "banners", "settings", "admin"]) {
    void qc.invalidateQueries({ queryKey: [key] });
  }
}

/**
 * Subscribes to Postgres changes so edits made in /admin appear on every open storefront tab
 * immediately — no redeploy and no manual refresh. (Realtime respects RLS; if Realtime is
 * disabled the 30s stale time + refetch-on-focus still keep content fresh.)
 */
export function useRealtimeContentSync() {
  const qc = useQueryClient();
  useEffect(() => {
    if (!supabase) return;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const schedule = (keys: string[]) => {
      for (const key of keys) {
        clearTimeout(timers.get(key));
        timers.set(
          key,
          setTimeout(() => void qc.invalidateQueries({ queryKey: [key] }), 250),
        );
      }
    };
    const channel = supabase
      .channel("content-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => schedule(["products", "admin"]))
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        schedule(["categories", "products", "admin"]),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, () => schedule(["banners", "admin"]))
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () =>
        schedule(["settings"]),
      )
      .subscribe();
    return () => {
      timers.forEach(clearTimeout);
      void supabase?.removeChannel(channel);
    };
  }, [qc]);
}
