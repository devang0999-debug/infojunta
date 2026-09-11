import type { Cadence } from "@/lib/pipeline/schema";

// Our data is about India and is dated in IST. The server renders in UTC on
// Vercel, so without a fixed zone an IST-midnight date formats to the day
// before. Pin every render to IST.
const IST = "Asia/Kolkata";

/** "2026-09-02T…" → "2 Sep 2026" (always in IST, wherever this runs). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST,
  });
}

// How old a snapshot's own "as of" date may get before we stop calling it
// fresh. Generous windows: weekends and the odd late release shouldn't trip it,
// but two-weeks-stale forex or a days-old FX rate should.
const MAX_AGE_DAYS: Record<Cadence, number> = {
  realtime: 2,
  daily: 2,
  weekly: 8,
  annual: 400,
};

/**
 * Is this snapshot stale for its cadence? Computed from the data's own as-of
 * date, so old data can never wear a "Live" badge just because a row exists.
 */
export function isStale(asOfDate: string, cadence: Cadence): boolean {
  const then = new Date(asOfDate).getTime();
  if (Number.isNaN(then)) return true;
  const ageDays = (Date.now() - then) / 86_400_000;
  return ageDays > MAX_AGE_DAYS[cadence];
}

/** Human "3 days ago" style age from an ISO date. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, (Date.now() - then) / 1000);
  const days = Math.floor(secs / 86400);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/** Indian-grouped number, e.g. 5065345 → "50,65,345". */
export function formatIndian(n: number, fractionDigits = 0): string {
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatValue(value: number | string, unit?: string): string {
  const num = typeof value === "number" ? formatIndian(value, unitDecimals(value)) : value;
  if (!unit) return String(num);
  // Units that read better as a prefix.
  if (unit === "₹") return `₹${num}`;
  return `${num} ${unit}`;
}

function unitDecimals(value: number): number {
  if (Number.isInteger(value)) return 0;
  return Math.abs(value) < 100 ? 2 : 0;
}
