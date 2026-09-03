import * as cheerio from "cheerio";
import { fetchHtml, toNumber } from "../fetch";
import { MODULE_KEYS, type NormalizedSnapshot, type SourceModule } from "../schema";

const SOURCE_URL = "https://www.rbi.org.in/";

/**
 * RBI publishes the current policy rates as a plain HTML accordion in the
 * "Current Rates" box (#wrapper) on its homepage. Each rate is a table row:
 *   <tr><th>Policy Repo Rate</th><td>: 5.25%</td></tr>
 * We read the WHOLE box into a name -> value map, then pick what we want. This
 * survives RBI re-ordering rows or adding sections.
 */

// Plain-English, one line each — this is the "translation" the product exists for.
const PLAIN: Record<string, string> = {
  "Policy Repo Rate":
    "The rate at which the RBI lends to banks. Up = loans and EMIs get costlier.",
  "Standing Deposit Facility Rate":
    "The floor rate at which banks park spare cash with the RBI (no collateral).",
  "Marginal Standing Facility Rate":
    "The emergency rate banks pay to borrow overnight from the RBI.",
  "Bank Rate":
    "The rate the RBI charges on longer-term lending to banks; a policy signal.",
  "Fixed Reverse Repo Rate":
    "The rate the RBI pays banks to park money with it, absorbing liquidity.",
  CRR: "Share of deposits banks must keep as cash with the RBI, earning nothing.",
  SLR: "Share of deposits banks must hold in safe assets like government bonds.",
  "INR / 1 USD": "How many rupees one US dollar buys right now (FBIL reference).",
};

// Which rows become headline metrics, and in what order.
const WANT: { name: string; key: string; unit: string }[] = [
  { name: "Policy Repo Rate", key: "repo", unit: "%" },
  { name: "Fixed Reverse Repo Rate", key: "reverse_repo", unit: "%" },
  { name: "Standing Deposit Facility Rate", key: "sdf", unit: "%" },
  { name: "Marginal Standing Facility Rate", key: "msf", unit: "%" },
  { name: "Bank Rate", key: "bank_rate", unit: "%" },
  { name: "CRR", key: "crr", unit: "%" },
  { name: "SLR", key: "slr", unit: "%" },
  { name: "INR / 1 USD", key: "inr_usd", unit: "₹" },
];

export function parseRbiRates(html: string): NormalizedSnapshot {
  const $ = cheerio.load(html);
  const box = $("#wrapper");
  if (box.length === 0) throw new Error("RBI: #wrapper rates box not found");

  const map = new Map<string, string>();
  box.find("tr").each((_, tr) => {
    const th = $(tr).find("th").first().text().replace(/\s+/g, " ").trim();
    const tdRaw = $(tr).find("td").first().text().replace(/\s+/g, " ").trim();
    const td = tdRaw.replace(/^:\s*/, "").trim();
    if (th && td) map.set(th, td);
  });

  if (!map.has("Policy Repo Rate")) {
    throw new Error("RBI: 'Policy Repo Rate' row missing — layout changed");
  }

  // "(As at 1.00pm of September 02, 2026)" → an ISO-ish as-of date.
  const asAt = box
    .find(".subText")
    .toArray()
    .map((el) => $(el).text().trim())
    .find((t) => /As at/i.test(t));
  const dateMatch = asAt?.match(/of\s+([A-Za-z]+ \d{1,2}, \d{4})/);
  const asOfDate = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

  const metrics = WANT.filter((w) => map.has(w.name)).map((w) => {
    const rawVal = map.get(w.name)!;
    const num = toNumber(rawVal);
    return {
      key: w.key,
      label: w.name,
      value: Number.isNaN(num) ? rawVal : num,
      unit: w.unit,
      plain: PLAIN[w.name],
    };
  });

  const repo = metrics.find((m) => m.key === "repo")?.value;
  const crr = metrics.find((m) => m.key === "crr")?.value;

  return {
    moduleKey: MODULE_KEYS.rbiRates,
    title: "RBI Policy Rates",
    cadence: "realtime",
    plainSummary:
      `The RBI's repo rate stands at ${repo}%, with CRR at ${crr}%. ` +
      `These set the cost of money across the economy — your loan EMIs, deposit ` +
      `returns and how much cash banks must keep aside all move with them.`,
    asOfDate,
    capturedAt: new Date().toISOString(),
    metrics,
    provenance: {
      sourceName: "Reserve Bank of India (Current Rates)",
      sourceUrl: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      note: "Scraped from the RBI homepage rates box; FX reference from FBIL.",
    },
  };
}

export const rbiPolicyRates: SourceModule = {
  key: MODULE_KEYS.rbiRates,
  label: "RBI Policy Rates",
  cadence: "realtime",
  sourceUrl: SOURCE_URL,
  async run() {
    const html = await fetchHtml(SOURCE_URL);
    return parseRbiRates(html);
  },
};
