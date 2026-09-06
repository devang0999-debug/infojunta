import rates from "@/data/snapshots/rbi-policy-rates.json";
import forex from "@/data/snapshots/rbi-forex-reserves.json";
import budget from "@/data/union-budget.json";

type Stat = { label: string; value: string; color: string };

function buildStats(): Stat[] {
  const m = (k: string) => rates.metrics.find((x) => x.key === k)?.value;
  const total = forex.metrics.find((x) => x.key === "total")?.value as number | undefined;
  return [
    { label: "Repo rate", value: `${m("repo")}%`, color: "text-pop-pink" },
    { label: "Forex reserves", value: total ? `₹${total}L cr` : "—", color: "text-pop-teal" },
    { label: "Union Budget", value: `₹${(budget.totalExpenditureCr / 100000).toFixed(1)}L cr`, color: "text-pop-yellow" },
    { label: "Fiscal deficit", value: `${budget.fiscalDeficitPctGdp}% GDP`, color: "text-pop-purple" },
    { label: "CRR", value: `${m("crr")}%`, color: "text-pop-blue" },
    { label: "SLR", value: `${m("slr")}%`, color: "text-pop-green" },
    { label: "₹ / USD", value: `${m("inr_usd")}`, color: "text-pop-pink" },
    { label: "Interest / ₹", value: `${budget.goesTo[1].paise}p`, color: "text-pop-teal" },
  ];
}

export function Ticker() {
  const stats = buildStats();
  const run = (
    <div className="ticker-track" aria-hidden>
      {[...stats, ...stats].map((s, i) => (
        <span
          key={i}
          className="flex items-center gap-2 px-5 font-[family-name:var(--font-mono)] text-sm tracking-tight text-paper"
        >
          <span className={s.color} aria-hidden>•</span>
          <span className="text-paper/60">{s.label}</span>
          <span className={`font-bold ${s.color}`}>{s.value}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-edge bg-ink py-2.5">
      {run}
    </div>
  );
}
