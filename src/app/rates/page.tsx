import type { Metadata } from "next";
import { getSnapshot } from "@/lib/pipeline/store";
import { MODULE_KEYS } from "@/lib/pipeline/schema";
import { MetricStat } from "@/components/metric-stat";
import { Provenance } from "@/components/provenance";
import { RecencyBadge } from "@/components/recency-badge";
import { notFound } from "next/navigation";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "RBI Policy Rates — infojunta",
  description:
    "India's current RBI policy rates — repo, reverse repo, MSF, SDF, bank rate, CRR, SLR — in plain language, pulled live from the RBI.",
};

export default async function RatesPage() {
  const snap = await getSnapshot(MODULE_KEYS.rbiRates);
  if (!snap) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <span className="sticker rotate-[-2deg]">Cost of money</span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-6xl">
          RBI Policy Rates
        </h1>
      </div>

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

      <div className="mt-8 max-w-3xl">
        <Provenance provenance={snap.provenance} moduleKey={snap.moduleKey} />
      </div>
    </div>
  );
}
