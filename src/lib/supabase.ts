import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NotConfiguredError } from "@/lib/errors";

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True only when real (non-placeholder) credentials are present. */
export const supabaseEnabled = Boolean(url && anon && !url.includes("your-project") && !anon.includes("your-anon"));

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url, anon)
  : null;

/** Returns the client or throws a clear "not configured" error. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new NotConfiguredError();
  return supabase;
}
