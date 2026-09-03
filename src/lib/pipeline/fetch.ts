/**
 * Custom fetch layer for government sites.
 *
 * We run our OWN pipeline (no third-party data aggregator sitting in the
 * middle) so there's no added lag between a release and our breakdown. Gov
 * sites are picky: they want a browser-ish User-Agent and can be slow, so we
 * set headers and a generous timeout, and always let the caller degrade to the
 * committed cache instead of showing a blank page.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 infojunta/0.1 (+civic-data)";

export async function fetchHtml(
  url: string,
  timeoutMs = 20_000,
): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      // We schedule our own refresh; never serve a stale framework cache here.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`GET ${url} -> HTTP ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** Parse "5.25", "5.25%", "6,81,000", "₹ 50,65,345 crore" -> number. */
export function toNumber(raw: string | undefined | null): number {
  if (raw == null) return NaN;
  const cleaned = String(raw)
    .replace(/[₹%,\s]/g, "")
    .replace(/[^\d.\-]/g, "");
  return cleaned === "" ? NaN : Number(cleaned);
}

export function direction(current: number, previous?: number) {
  if (previous == null || Number.isNaN(previous)) return "flat" as const;
  if (current > previous) return "up" as const;
  if (current < previous) return "down" as const;
  return "flat" as const;
}
