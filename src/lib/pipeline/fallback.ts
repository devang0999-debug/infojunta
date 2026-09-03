import ratesSeed from "@/data/snapshots/rbi-policy-rates.json";
import forexSeed from "@/data/snapshots/rbi-forex-reserves.json";
import { buildBudgetSnapshot } from "./sources/union-budget";
import { MODULE_KEYS, type NormalizedSnapshot } from "./schema";

/**
 * Committed baseline data — the site NEVER shows a blank page. If Supabase is
 * unconfigured or a scrape fails, we serve this. The scraped feeds are seeded
 * JSON (regenerated on each successful refresh); the Budget is derived, since
 * it's deterministic.
 */
export function fallbackSnapshot(key: string): NormalizedSnapshot | null {
  switch (key) {
    case MODULE_KEYS.rbiRates:
      return { ...(ratesSeed as unknown as NormalizedSnapshot), stale: true };
    case MODULE_KEYS.rbiForex:
      return { ...(forexSeed as unknown as NormalizedSnapshot), stale: true };
    case MODULE_KEYS.unionBudget:
      return buildBudgetSnapshot();
    default:
      return null;
  }
}
