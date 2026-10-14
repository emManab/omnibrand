import { supabase } from "@/lib/supabase";

/**
 * Resolves a stored media reference to a displayable URL.
 *  - absolute URLs, site-relative paths ("/images/x.svg"), data: and blob: URLs pass through
 *  - "bucket/object/path.webp" resolves to the Supabase Storage public URL
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("/") || /^(data|blob):/i.test(path)) {
    return path;
  }
  const slash = path.indexOf("/");
  if (slash < 1 || !supabase) return path;
  const bucket = path.slice(0, slash);
  const object = path.slice(slash + 1);
  return supabase.storage.from(bucket).getPublicUrl(object).data.publicUrl;
}

/** Splits "bucket/object" into its parts; returns null for external / local URLs. */
export function splitStoragePath(path: string | null | undefined): { bucket: string; object: string } | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("/") || /^(data|blob):/i.test(path)) return null;
  const slash = path.indexOf("/");
  if (slash < 1) return null;
  return { bucket: path.slice(0, slash), object: path.slice(slash + 1) };
}
