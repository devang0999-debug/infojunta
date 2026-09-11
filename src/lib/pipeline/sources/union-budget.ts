import budget from "@/data/union-budget.json";
import {
  MODULE_KEYS,
  type BreakdownItem,
  type NormalizedSnapshot,
  type SourceModule,
} from "../schema";

/**
 * Union Budget expenditure.
 *
 * Unlike the RBI feeds, the Budget is an ANNUAL release locked in PDFs/Excel,
 * so we don't pretend it's a weekly scrape. It's a verified, source-cited
 * snapshot (Budget at a Glance) refreshed each February. Same normalized shape
 * as everything else, so the UI treats it identically.
 */

const LAKH_CR = 100_000; // 1 lakh crore = 1,00,000 crore

export function buildBudgetSnapshot(): NormalizedSnapshot {
  const goesTo: BreakdownItem[] = budget.goesTo.map((g) => ({
    label: g.label,
    value: g.paise,
    unit: "paise/₹",
    share: g.paise, // paise-per-rupee already is a percentage
    colorKey: g.colorKey,
  }));

  const totalLakhCr = budget.totalExpenditureCr / LAKH_CR;
  const capexLakhCr = budget.capexCr / LAKH_CR;

  // The Budget is an annual, verified dataset — its capture date is fixed to
  // when we compiled it, NOT `new Date()`. Stamping "now" made February data
  // claim it was "pulled today", which is exactly the freshness lie we forbid.
  const capturedAt = new Date(budget.capturedOn).toISOString();

  return {
    moduleKey: MODULE_KEYS.unionBudget,
    title: `Union Budget ${budget.fiscalYear} — Where the money goes`,
    cadence: "annual",
    plainSummary:
      `The government plans to spend about ₹${totalLakhCr.toFixed(1)} lakh crore in ${budget.fiscalYear}. ` +
      `The biggest slices go to the states' share of taxes (${budget.goesTo[0].paise} paise of every rupee) and ` +
      `interest on past borrowing (${budget.goesTo[1].paise} paise). The fiscal deficit is targeted at ${budget.fiscalDeficitPctGdp}% of GDP.`,
    asOfDate: new Date(budget.presentedOn).toISOString(),
    capturedAt,
    metrics: [
      {
        key: "total_expenditure",
        label: "Total expenditure",
        value: Number(totalLakhCr.toFixed(2)),
        unit: "₹ lakh cr",
        plain: "Everything the central government plans to spend this year.",
      },
      {
        key: "capex",
        label: "Capital expenditure",
        value: Number(capexLakhCr.toFixed(2)),
        unit: "₹ lakh cr",
        plain: "Money spent building assets — roads, railways, ports — not day-to-day running.",
      },
      {
        key: "fiscal_deficit",
        label: "Fiscal deficit",
        value: budget.fiscalDeficitPctGdp,
        unit: "% of GDP",
        plain: "How much more the government spends than it earns, as a share of the economy.",
      },
      {
        key: "interest_share",
        label: "Interest payments",
        value: budget.goesTo[1].paise,
        unit: "paise/₹",
        plain: "Of every rupee spent, this much just services old debt.",
      },
    ],
    breakdown: goesTo,
    provenance: {
      sourceName: budget.source.name,
      sourceUrl: budget.source.url,
      fetchedAt: capturedAt,
      note: budget.note,
    },
  };
}

export const unionBudget: SourceModule = {
  key: MODULE_KEYS.unionBudget,
  label: "Union Budget",
  cadence: "annual",
  sourceUrl: budget.source.url,
  async run() {
    return buildBudgetSnapshot();
  },
};
