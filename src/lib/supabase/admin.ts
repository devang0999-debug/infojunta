import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only, used by the refresh pipeline to
 * write snapshots. Bypasses RLS. Never import this from client code.
 * Returns null when unconfigured so refresh still works locally (writing the
 * committed JSON fallback instead of the database).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin = isAdminConfigured
  ? createClient(url!, serviceKey!, { auth: { persistSession: false } })
  : null;
