import type { Metadata } from "next";
import budget from "@/data/union-budget-2025-26.json";
import { getSnapshot } from "@/lib/pipeline/store";
import { MODULE_KEYS, type BreakdownItem } from "@/lib/pipeline/schema";
import { MetricStat } from "@/components/metric-stat";
import { BreakdownBars } from "@/components/breakdown-bars";
import { Provenance } from "@/components/provenance";
import { RecencyBadge } from "@/components/recency-badge";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Union Budget 2025-26 — Where the money goes — infojunta",
  description:
    "The Union Budget 2025-26, broken down: where every rupee comes from and where it goes, in plain paise-per-rupee terms.",
};

export default async function BudgetPage() {
  const snap = await getSnapshot(MODULE_KEYS.unionBudget);
  if (!snap) notFound();

  const comesFrom: BreakdownItem[] = budget.comesFrom.map((c) => ({
    label: c.label,
    value: c.paise,
    unit: "paise",
    share: c.paise,
    colorKey: c.colorKey,
  }));
  const goesTo = snap.breakdown ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <span className="sticker rotate-[-2deg]">🧾 Your tax rupee, sliced</span>
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

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="pop-card bg-white p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-xl">
            <span className="pop-underline">Where the rupee comes from</span>
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-soft">
            Per ₹1 of government income
          </p>
          <BreakdownBars items={comesFrom} valueSuffix="p" />
        </section>

        <section className="pop-card bg-white p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-xl">
            <span className="pop-underline">Where the rupee goes</span>
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-soft">
            Per ₹1 of government spending
          </p>
          <BreakdownBars items={goesTo} valueSuffix="p" />
        </section>
      </div>

      <div className="mt-8 max-w-3xl">
        <Provenance provenance={snap.provenance} moduleKey={snap.moduleKey} />
      </div>
    </div>
  );
}
