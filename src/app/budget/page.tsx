import type { Metadata } from "next";
import budget from "@/data/union-budget.json";
import { getSnapshot } from "@/lib/pipeline/store";
import { MODULE_KEYS } from "@/lib/pipeline/schema";
import { MetricStat } from "@/components/metric-stat";
import { Provenance } from "@/components/provenance";
import { RecencyBadge } from "@/components/recency-badge";
import { BudgetExplorer, type BudgetData } from "@/components/budget-explorer";
import { SourceLink } from "@/components/tracked-link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Union Budget 2026-27 — Story, Explore & Your Share — kya haal junta?",
  description:
    "The Union Budget 2026-27 as a story, an interactive explorer (down to ministry allocations), and a 'your share' split — all from real government figures.",
};

export default async function BudgetPage() {
  const snap = await getSnapshot(MODULE_KEYS.unionBudget);
  if (!snap) notFound();

  const data: BudgetData = {
    fiscalYear: budget.fiscalYear,
    totalExpenditureCr: budget.totalExpenditureCr,
    capexCr: budget.capexCr,
    fiscalDeficitPctGdp: budget.fiscalDeficitPctGdp,
    comesFrom: budget.comesFrom,
    goesTo: budget.goesTo,
    ministries: budget.ministries,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <span className="sticker rotate-[-2deg]">Your tax rupee, sliced</span>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide sm:text-6xl">
        Union Budget {budget.fiscalYear}
      </h1>

      <div className="mt-6 speech max-w-3xl p-5">
        <p className="text-lg">{snap.plainSummary}</p>
      </div>

      <div className="mt-4">
        <RecencyBadge asOfDate={snap.asOfDate} cadence={snap.cadence} stale={snap.stale} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {snap.metrics.map((m) => (
          <MetricStat key={m.key} metric={m} />
        ))}
      </div>

      <section className="mt-10">
        <BudgetExplorer data={data} />
      </section>

      <div className="mt-8 max-w-3xl space-y-3">
        <Provenance provenance={snap.provenance} moduleKey={snap.moduleKey} />
        <p className="text-xs text-ink-soft">
          Ministry allocations:{" "}
          <SourceLink
            href={budget.ministriesSource.url}
            moduleKey={snap.moduleKey}
            className="underline decoration-pop-blue decoration-2 underline-offset-2"
          >
            {budget.ministriesSource.name} ↗
          </SourceLink>
        </p>
      </div>
    </div>
  );
}
