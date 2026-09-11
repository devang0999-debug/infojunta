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

/**
 * Persist a fresh snapshot: Supabase (if configured) + committed JSON (dev).
 *
 * Fails LOUDLY. The Supabase client returns errors instead of throwing, so a
 * failed write used to pass silently and the daily cron reported success while
 * saving nothing. Now any write error throws, and a scraped module that lands
 * nowhere (no Supabase, read-only disk) throws too — so `refreshModule` reports
 * `ok: false` and the endpoint returns 502 instead of a quiet lie.
 */
export async function saveSnapshot(snap: NormalizedSnapshot): Promise<void> {
  let persisted = false;

  if (isAdminConfigured && supabaseAdmin) {
    const { error: upsertError } = await supabaseAdmin.from(TABLE).upsert(
      {
        module_key: snap.moduleKey,
        payload: snap,
        as_of_date: snap.asOfDate,
        captured_at: snap.capturedAt,
      },
      { onConflict: "module_key" },
    );
    if (upsertError) {
      throw new Error(
        `Supabase upsert failed for ${snap.moduleKey}: ${upsertError.message}`,
      );
    }

    const { error: historyError } = await supabaseAdmin.from(HISTORY).insert({
      module_key: snap.moduleKey,
      payload: snap,
      as_of_date: snap.asOfDate,
      captured_at: snap.capturedAt,
    });
    if (historyError) {
      throw new Error(
        `Supabase history insert failed for ${snap.moduleKey}: ${historyError.message}`,
      );
    }
    persisted = true;
  }

  // Best-effort: refresh the committed fallback so localhost always has the
  // latest even without Supabase. Skipped on read-only hosts (Vercel), where
  // Supabase above is the source of truth. The Budget is derived, not scraped,
  // so it has no committed snapshot file to refresh.
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
      persisted = true;
    } catch {
      // read-only filesystem — fine as long as Supabase persisted above.
    }

    if (!persisted) {
      throw new Error(
        `Nothing persisted for ${snap.moduleKey}: Supabase is not configured ` +
          `and the local filesystem is read-only. Set SUPABASE_SERVICE_ROLE_KEY ` +
          `so refreshes are actually saved.`,
      );
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
