import type { Metadata } from "next";
import { getSnapshot } from "@/lib/pipeline/store";
import { MODULE_KEYS } from "@/lib/pipeline/schema";
import { MetricStat } from "@/components/metric-stat";
import { DonutChart } from "@/components/donut-chart";
import { Provenance } from "@/components/provenance";
import { RecencyBadge } from "@/components/recency-badge";
import { RefreshButton } from "@/components/refresh-button";
import { notFound } from "next/navigation";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "India's Forex Reserves — infojunta",
  description:
    "India's foreign exchange reserves broken down — total, foreign currency assets, gold, SDRs and the IMF position — pulled from the RBI Weekly Statistical Supplement.",
};

export default async function ReservesPage() {
  const snap = await getSnapshot(MODULE_KEYS.rbiForex);
  if (!snap) notFound();

  const total = snap.metrics.find((m) => m.key === "total");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="sticker rotate-[2deg]">What backs the rupee</span>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide sm:text-6xl">
            Forex Reserves
          </h1>
        </div>
        <RefreshButton moduleKey={snap.moduleKey} />
      </div>

      <div className="mt-6 speech max-w-3xl p-5">
        <p className="text-lg">{snap.plainSummary}</p>
      </div>

      <div className="mt-4">
        <RecencyBadge asOfDate={snap.asOfDate} cadence={snap.cadence} stale={snap.stale} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {snap.metrics.map((m) => (
          <MetricStat key={m.key} metric={m} />
        ))}
      </div>

      {snap.breakdown && snap.breakdown.length > 0 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">
            <span className="pop-underline">What&rsquo;s inside the reserves</span>
          </h2>
          <div className="pop-card mt-5 p-6">
            <DonutChart
              items={snap.breakdown}
              centerTop={total ? `₹${total.value}` : undefined}
              centerBottom="lakh cr total"
            />
          </div>
        </section>
      )}

      <div className="mt-8 max-w-3xl">
        <Provenance provenance={snap.provenance} moduleKey={snap.moduleKey} />
      </div>
    </div>
  );
}
