import { promises as fs } from "node:fs";
import path from "node:path";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";
import { fallbackSnapshot } from "./fallback";
import { getModule } from "./registry";
import { MODULE_KEYS, type NormalizedSnapshot } from "./schema";

const TABLE = "snapshots";
const HISTORY = "snapshot_history";

/** Prefer service-role (bypasses RLS); fall back to anon read; else null. */
const reader = supabaseAdmin ?? supabase;

/**
 * Read the latest snapshot for a module: live Supabase row first, committed
 * fallback otherwise. Always returns something renderable (or null for an
 * unknown key).
 */
export async function getSnapshot(key: string): Promise<NormalizedSnapshot | null> {
  if (reader) {
    try {
      const { data, error } = await reader
        .from(TABLE)
        .select("payload")
        .eq("module_key", key)
        .maybeSingle();
      if (!error && data?.payload) {
        return data.payload as NormalizedSnapshot;
      }
    } catch {
      // fall through to committed fallback
    }
  }
  return fallbackSnapshot(key);
}

export async function getAllSnapshots(): Promise<NormalizedSnapshot[]> {
  const keys = Object.values(MODULE_KEYS);
  const snaps = await Promise.all(keys.map((k) => getSnapshot(k)));
  return snaps.filter((s): s is NormalizedSnapshot => s !== null);
}

/** Persist a fresh snapshot: Supabase (if configured) + committed JSON (dev). */
export async function saveSnapshot(snap: NormalizedSnapshot): Promise<void> {
  if (isAdminConfigured && supabaseAdmin) {
    await supabaseAdmin.from(TABLE).upsert(
      {
        module_key: snap.moduleKey,
        payload: snap,
        as_of_date: snap.asOfDate,
        captured_at: snap.capturedAt,
      },
      { onConflict: "module_key" },
    );
    await supabaseAdmin.from(HISTORY).insert({
      module_key: snap.moduleKey,
      payload: snap,
      as_of_date: snap.asOfDate,
      captured_at: snap.capturedAt,
    });
  }

  // Best-effort: refresh the committed fallback so localhost always has the
  // latest even without Supabase. Silently skipped on read-only hosts (Vercel).
  if (snap.moduleKey !== MODULE_KEYS.unionBudget) {
    try {
      const file = path.join(
        process.cwd(),
        "src",
        "data",
        "snapshots",
        `${snap.moduleKey}.json`,
      );
      await fs.writeFile(file, JSON.stringify(snap, null, 2) + "\n", "utf8");
    } catch {
      // read-only filesystem — fine, Supabase is the source of truth there.
    }
  }
}

/** Run a module's scrape, persist it, and return it. Degrades to fallback. */
export async function refreshModule(
  key: string,
): Promise<{ ok: boolean; snapshot: NormalizedSnapshot | null; error?: string }> {
  const mod = getModule(key);
  if (!mod) return { ok: false, snapshot: null, error: `Unknown module: ${key}` };
  try {
    const snapshot = await mod.run();
    await saveSnapshot(snapshot);
    return { ok: true, snapshot };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, snapshot: fallbackSnapshot(key), error };
  }
}
