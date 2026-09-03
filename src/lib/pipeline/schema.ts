/**
 * The one shape every government source collapses into.
 *
 * A source can be a live HTML scrape (RBI), a weekly table (forex), or a
 * verified annual snapshot (Union Budget) — the UI never cares which. It only
 * ever renders a `NormalizedSnapshot`. This uniformity is the whole point:
 * "any messy source in, one clean readable shape out."
 */

export type Cadence = "realtime" | "daily" | "weekly" | "annual";

export type Direction = "up" | "down" | "flat";

export interface Metric {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  /** Plain-language, one line: what this number means for a normal person. */
  plain?: string;
  previous?: number | string;
  change?: number;
  changeLabel?: string;
  direction?: Direction;
}

export interface BreakdownItem {
  label: string;
  value: number;
  unit?: string;
  /** 0..100 percentage share of the whole. */
  share?: number;
  colorKey?: string;
  note?: string;
}

export interface Provenance {
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string; // ISO
  note?: string;
}

export interface NormalizedSnapshot {
  moduleKey: string;
  title: string;
  cadence: Cadence;
  /** Machine-generated plain-English summary of the release. */
  plainSummary: string;
  /** The date the data itself is "as of" (not when we fetched it). */
  asOfDate: string;
  capturedAt: string; // ISO — when this snapshot was produced
  metrics: Metric[];
  breakdown?: BreakdownItem[];
  provenance: Provenance;
  /** True when we fell back to the committed cache (scrape failed / offline). */
  stale?: boolean;
}

/** Every source module implements this. */
export interface SourceModule {
  key: string;
  label: string;
  cadence: Cadence;
  sourceUrl: string;
  /** Pull + parse into the normalized shape. Must throw on a hard failure. */
  run(): Promise<NormalizedSnapshot>;
}

export const MODULE_KEYS = {
  rbiRates: "rbi-policy-rates",
  rbiForex: "rbi-forex-reserves",
  unionBudget: "union-budget",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];
