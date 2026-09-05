import { getAllSnapshots, getSnapshot } from "@/lib/pipeline/store";
import { MODULE_KEYS } from "@/lib/pipeline/schema";
import { formatDate, formatValue } from "@/lib/format";
import { BreakdownCard } from "@/components/breakdown-card";
import { BreakdownBars } from "@/components/breakdown-bars";
import { QuestionSearch } from "@/components/question-search";

export const revalidate = 300;

const CARD_META: Record<string, { href: string; accent: string }> = {
  [MODULE_KEYS.rbiRates]: { href: "/rates", accent: "pop-blue" },
  [MODULE_KEYS.rbiForex]: { href: "/reserves", accent: "pop-teal" },
  [MODULE_KEYS.unionBudget]: { href: "/budget", accent: "pop-red" },
};

function Chip({
  value,
  label,
  colorKey,
}: {
  value: string;
  label: string;
  colorKey: string;
}) {
  return (
    <div
      className="pop-card-sm on-pop px-4 py-2.5"
      style={{ background: `var(--color-${colorKey})` }}
    >
      <div className="font-[family-name:var(--font-heading)] text-xl leading-none">
        {value}
      </div>
      <div className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

export default async function Home() {
  const snapshots = await getAllSnapshots();
  const forex = await getSnapshot(MODULE_KEYS.rbiForex);
  const rates = await getSnapshot(MODULE_KEYS.rbiRates);
  const budget = await getSnapshot(MODULE_KEYS.unionBudget);

  const repo = rates?.metrics.find((m) => m.key === "repo");
  const total = forex?.metrics.find((m) => m.key === "total");
  const deficit = budget?.metrics.find((m) => m.key === "fiscal_deficit");
  const budgetTotal = budget?.metrics.find((m) => m.key === "total_expenditure");

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-10 pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-14">
        {/* Left */}
        <div>
          <span className="sticker on-pop bg-pop-teal!">
            <span className="text-pop-red">●</span> Live · 3 official sources
          </span>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
            Government
            <br />
            data,
            <br />
            <span className="ink-outline italic">decoded.</span>
          </h1>

          <div className="mt-6 inline-block -rotate-1 border-[2.5px] border-ink bg-pop-yellow px-3 py-1.5 shadow-[3px_3px_0_var(--color-ink)]">
            <span className="on-pop font-[family-name:var(--font-heading)] text-sm">
              Central releases · Made readable · Made honest
            </span>
          </div>

          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            RBI rates, forex reserves and the Union Budget — turned into clean
            numbers the moment they drop.{" "}
            <span className="font-bold text-ink">No 400-page PDFs. No login. No paywall.</span>
          </p>

          <div className="mt-7 max-w-xl">
            <QuestionSearch />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {repo && <Chip value={formatValue(repo.value, "%")} label="Repo rate" colorKey="pop-yellow" />}
            {total && <Chip value={`₹${total.value}L cr`} label="Forex reserves" colorKey="pop-teal" />}
            {budgetTotal && (
              <Chip value={`₹${budgetTotal.value}L cr`} label="Union Budget" colorKey="pop-pink" />
            )}
            {deficit && <Chip value={`${deficit.value}%`} label="Fiscal deficit" colorKey="pop-purple" />}
          </div>
        </div>

        {/* Right — live forex hero card */}
        {forex && total && (
          <div className="relative">
            <div className="pop-card overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink bg-pop-pink px-5 py-3">
                <span className="font-[family-name:var(--font-heading)] text-white">
                  FOREX RESERVES
                </span>
                <span className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-on-pop">
                  as of {formatDate(forex.asOfDate)}
                </span>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="font-[family-name:var(--font-heading)] text-4xl leading-none sm:text-5xl">
                    ₹{total.value}
                    <span className="text-xl"> L cr</span>
                  </span>
                  {total.changeLabel && (
                    <span className="mb-1 font-[family-name:var(--font-mono)] text-sm font-bold text-up">
                      ▲ {total.changeLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-soft">Total foreign exchange reserves</p>

                {forex.breakdown && (
                  <div className="mt-5">
                    <BreakdownBars items={forex.breakdown} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 border-t-[3px] border-ink">
                {forex.breakdown?.slice(0, 3).map((b, i) => (
                  <div
                    key={b.label}
                    className={`px-3 py-3 ${i < 2 ? "border-r-[3px] border-ink" : ""}`}
                  >
                    <div className="font-[family-name:var(--font-heading)] text-lg leading-none">
                      ₹{b.value}
                      <span className="text-[10px]"> L cr</span>
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase text-ink-soft">
                      {b.label.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* trust pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-end">
              <span className="sticker">No login</span>
              <span className="sticker">No paywall</span>
              <span className="sticker">Every number sourced</span>
            </div>
          </div>
        )}
      </section>

      {/* Live breakdowns */}
      <section className="pt-6 pb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">
          <span className="pop-underline">Live breakdowns</span>
        </h2>
        <p className="mt-2 text-ink-soft">
          Pulled straight from official sources. Click any card to break it down.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {snapshots.map((snap) => {
            const meta = CARD_META[snap.moduleKey] ?? { href: "/", accent: "pop-blue" };
            return (
              <BreakdownCard
                key={snap.moduleKey}
                snapshot={snap}
                href={meta.href}
                accentColorKey={meta.accent}
              />
            );
          })}
        </div>
      </section>

      {/* Mission */}
      <section className="pb-10">
        <div className="pop-card on-pop bg-pop-yellow! p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">
            The problem isn&rsquo;t missing data. It&rsquo;s missing translation.
          </h2>
          <p className="mt-3 max-w-3xl">
            India&rsquo;s government publishes an enormous amount of data — but it
            lands locked in PDFs and ugly spreadsheets, and by the time anyone
            parses it, the news cycle is over. kya haal junta? takes those fresh
            releases and makes them visible and transparent, instantly.
          </p>
        </div>
      </section>
    </div>
  );
}
