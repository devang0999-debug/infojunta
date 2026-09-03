/** "2026-09-02T…" → "2 Sep 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
