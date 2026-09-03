import { createClient } from "@supabase/supabase-js";

/**
 * Public, anon Supabase client (read-only, no login).
 * Returns null when Supabase isn't configured yet, so the whole app still runs
 * off committed fallback data. Never throws at import.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: false } })
  : null;
