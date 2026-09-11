import budget from "@/data/union-budget.json";
import { formatDate } from "@/lib/format";
import { MODULE_KEYS, type NormalizedSnapshot } from "@/lib/pipeline/schema";
import type { CivicQuestion } from "@/lib/questions";

/**
 * Ask answers are templates, not frozen prose. Any figure that can change
 * (repo rate, dollar rate, forex total, budget shares) is written as a
 * `{{token}}` and filled from the SAME snapshots the pages render — so Ask can
 * never contradict /rates or /reserves the way hardcoded numbers did.
 */

function num(snap: NormalizedSnapshot | undefined, key: string): number | undefined {
  const v = snap?.metrics.find((m) => m.key === key)?.value;
  return typeof v === "number" ? v : undefined;
}

/** A `goesTo` breakdown item's paise value, matched by label prefix. */
function paise(snap: NormalizedSnapshot | undefined, labelPrefix: string): number | undefined {
  return snap?.breakdown?.find((b) => b.label.startsWith(labelPrefix))?.value;
}

/** A reserves breakdown item's percentage share, matched by label prefix. */
function share(snap: NormalizedSnapshot | undefined, labelPrefix: string): number | undefined {
  return snap?.breakdown?.find((b) => b.label.startsWith(labelPrefix))?.share;
}

/** Build the {{token}} → string map from live snapshots. */
export function buildAnswerValues(snapshots: NormalizedSnapshot[]): Record<string, string> {
  const by = (k: string) => snapshots.find((s) => s.moduleKey === k);
  const rates = by(MODULE_KEYS.rbiRates);
  const forex = by(MODULE_KEYS.rbiForex);
  const bud = by(MODULE_KEYS.unionBudget);

  const v: Record<string, string> = {};
  const set = (k: string, val: string | number | undefined) => {
    if (val !== undefined && val !== null && val !== "") v[k] = String(val);
  };

  // Rates
  set("repo", num(rates, "repo"));
  set("crr", num(rates, "crr"));
  set("slr", num(rates, "slr"));
  const usd = num(rates, "inr_usd");
  set("inrUsd", usd !== undefined ? usd.toFixed(2) : undefined);
  if (rates) set("ratesAsOf", formatDate(rates.asOfDate));

  // Forex reserves
  const total = num(forex, "total");
  set("forexTotal", total !== undefined ? total.toFixed(1) : undefined);
  const gold = num(forex, "gold");
  set("forexGold", gold !== undefined ? gold.toFixed(1) : undefined);
  const goldShare = share(forex, "Gold");
  set("forexGoldShare", goldShare !== undefined ? Math.round(goldShare) : undefined);
  if (forex) set("forexAsOf", formatDate(forex.asOfDate));

  // Union Budget
  const budgetTotal = num(bud, "total_expenditure");
  set("budgetTotal", budgetTotal !== undefined ? budgetTotal.toFixed(1) : undefined);
  set("fiscalDeficit", num(bud, "fiscal_deficit"));
  set("interestPaise", num(bud, "interest_share"));
  set("statesPaise", paise(bud, "States'"));
  set("defencePaise", paise(bud, "Defence"));
  const defence = budget.ministries.find((m) => m.name === "Defence");
  set("defenceLakhCr", defence ? (defence.crore / 100_000).toFixed(2) : undefined);

  return v;
}

const TOKEN = /\{\{(\w+)\}\}/g;

/** Fill {{token}}s in one answer. Unknown tokens render as an em dash. */
export function resolveAnswer(answer: string, values: Record<string, string>): string {
  return answer.replace(TOKEN, (_match, key: string) =>
    key in values ? values[key] : "—",
  );
}

/** Resolve every question's answer against the live snapshots. */
export function resolveQuestions(
  questions: CivicQuestion[],
  snapshots: NormalizedSnapshot[],
): CivicQuestion[] {
  const values = buildAnswerValues(snapshots);
  return questions.map((q) =>
    q.answer.includes("{{") ? { ...q, answer: resolveAnswer(q.answer, values) } : q,
  );
}
