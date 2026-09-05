import * as cheerio from "cheerio";
import { fetchHtml, toNumber } from "../fetch";
import {
  MODULE_KEYS,
  type BreakdownItem,
  type NormalizedSnapshot,
  type SourceModule,
} from "../schema";

/**
 * RBI Weekly Statistical Supplement → Foreign Exchange Reserves.
 *
 * The reserves table changes URL every week, so we NEVER hardcode a link:
 *  1. Fetch the WSS section listing.
 *  2. Take the FIRST (latest) "Foreign Exchange Reserves" entry → WSSView Id.
 *  3. Fetch that table and parse it.
 * This is our own two-hop pipeline — no aggregator in between, so no added lag.
 */

const LISTING_URL =
  "https://www.rbi.org.in/scripts/WSSViewDetail.aspx?TYPE=Section&PARAM1=2";
const VIEW_BASE = "https://www.rbi.org.in/scripts/WSSView.aspx?Id=";

const ROWS: { match: RegExp; label: string; key: string; colorKey: string }[] = [
  { match: /Total Reserves/i, label: "Total Reserves", key: "total", colorKey: "pop-blue" },
  {
    match: /Foreign Currency Assets/i,
    label: "Foreign Currency Assets",
    key: "fca",
    colorKey: "pop-teal",
  },
  { match: /Gold/i, label: "Gold", key: "gold", colorKey: "pop-yellow" },
  { match: /SDRs/i, label: "SDRs", key: "sdr", colorKey: "pop-pink" },
  {
    match: /Reserve Position in the IMF/i,
    label: "Reserve Position in the IMF",
    key: "imf",
    colorKey: "pop-purple",
  },
];

export function resolveLatestForexId(listingHtml: string): string {
  // href is unquoted in the listing: href=WSSView.aspx?Id=28669>Foreign Exchange Reserves
  const m = listingHtml.match(
    /href=WSSView\.aspx\?Id=(\d+)>\s*Foreign Exchange Reserves/i,
  );
  if (!m) throw new Error("Forex: no WSSView link found in WSS listing");
  return m[1];
}

export function parseForexTable(html: string): NormalizedSnapshot {
  const $ = cheerio.load(html);

  // As-on date, e.g. "As on Aug. 21, 2026" (read off the raw HTML text).
  const asOnText = html.match(/As on\s+([A-Za-z.]+\s+\d{1,2},\s+\d{4})/);
  const asOfDate = asOnText
    ? new Date(asOnText[1].replace(/\./g, "")).toISOString()
    : new Date().toISOString();

  // Build a label -> [8 numeric columns] map from every 9+ cell row in the doc.
  // Row labels ("1 Total Reserves", "1.2 Gold", ...) are unique, so a global
  // sweep is simpler and more robust than locating the exact <table>.
  const rowValues = new Map<string, number[]>();
  $("tr").each((_, tr) => {
    // Direct children only — .find() is recursive and would swallow the cells
    // of nested layout tables (RBI wraps data tables in outer layout tables).
    const cells = $(tr)
      .children("td")
      .toArray()
      .map((td) => $(td).text().replace(/\s+/g, " ").trim());
    if (cells.length < 9) return;
    const nums = cells.slice(1, 9).map((c) => toNumber(c));
    rowValues.set(cells[0], nums);
  });
  if (![...rowValues.keys()].some((k) => /Total Reserves/i.test(k))) {
    throw new Error("Forex: reserves table rows not found");
  }

  // Columns: [₹Cr as-on, US$Mn as-on, ₹Cr week-var, US$Mn week-var, ...].
  // We report strictly in INR, so we keep the ₹-crore columns (0 and 2).
  const items = ROWS.map((r) => {
    const entry = [...rowValues.entries()].find(([label]) => r.match.test(label));
    const nums = entry?.[1] ?? [];
    return {
      ...r,
      inrCr: nums[0],
      weekVarInrCr: nums[2],
    };
  });

  const total = items.find((i) => i.key === "total");
  if (!total || Number.isNaN(total.inrCr)) {
    throw new Error("Forex: could not read Total Reserves value");
  }

  // Report strictly in INR. The WSS gives an exact ₹-crore column, so we use
  // it directly (no USD conversion) and present it as ₹ lakh crore.
  const LAKH_CR = 100_000; // 1 lakh crore = 1,00,000 crore
  const toLakhCr = (cr: number) => Number((cr / LAKH_CR).toFixed(2));
  const totalLakhCr = total.inrCr / LAKH_CR;
  const weekVarLakhCr = (total.weekVarInrCr ?? 0) / LAKH_CR;

  const metrics = items.map((i) => {
    const wk = i.weekVarInrCr ?? 0;
    return {
      key: i.key,
      label: i.label,
      value: toLakhCr(i.inrCr),
      unit: "₹ lakh cr",
      plain:
        i.key === "total"
          ? "India's total war-chest of foreign assets — what backs the rupee and pays for imports."
          : i.key === "fca"
            ? "Foreign currencies the RBI holds (dollars, euros, etc.) — the bulk of the reserves."
            : i.key === "gold"
              ? "Gold held as reserve; rises in value when gold prices climb."
              : i.key === "sdr"
                ? "Special Drawing Rights — an IMF reserve asset India can draw on."
                : "India's automatic drawing quota at the IMF.",
      previous: toLakhCr(i.inrCr - wk),
      change: Number((wk / LAKH_CR).toFixed(2)),
      changeLabel: `${wk >= 0 ? "+" : ""}${(wk / LAKH_CR).toFixed(2)} L cr WoW`,
      direction: wk > 0 ? ("up" as const) : wk < 0 ? ("down" as const) : ("flat" as const),
    };
  });

  // Composition (exclude the "total" row) for the donut.
  const breakdown: BreakdownItem[] = items
    .filter((i) => i.key !== "total" && !Number.isNaN(i.inrCr))
    .map((i) => ({
      label: i.label,
      value: toLakhCr(i.inrCr),
      unit: "₹ lakh cr",
      share: Number(((i.inrCr / total.inrCr) * 100).toFixed(1)),
      colorKey: i.colorKey,
    }));

  return {
    moduleKey: MODULE_KEYS.rbiForex,
    title: "India's Foreign Exchange Reserves",
    cadence: "weekly",
    plainSummary:
      `India's foreign exchange reserves stand at about ₹${totalLakhCr.toFixed(1)} lakh crore, ` +
      `${weekVarLakhCr >= 0 ? "up" : "down"} ₹${Math.abs(weekVarLakhCr).toFixed(2)} lakh crore over the week. ` +
      `Reserves cushion the rupee and pay for imports; most of it sits in foreign currencies, the rest in gold, SDRs and the IMF.`,
    asOfDate,
    capturedAt: new Date().toISOString(),
    metrics,
    breakdown,
    provenance: {
      sourceName: "Reserve Bank of India — Weekly Statistical Supplement",
      sourceUrl: LISTING_URL,
      fetchedAt: new Date().toISOString(),
      note: "Latest 'Foreign Exchange Reserves' table from the WSS (₹ crore column). ~1 week reporting lag.",
    },
  };
}

export const rbiForexReserves: SourceModule = {
  key: MODULE_KEYS.rbiForex,
  label: "Forex Reserves",
  cadence: "weekly",
  sourceUrl: LISTING_URL,
  async run() {
    const listing = await fetchHtml(LISTING_URL, 30_000);
    const id = resolveLatestForexId(listing);
    const table = await fetchHtml(VIEW_BASE + id, 20_000);
    return parseForexTable(table);
  },
};
