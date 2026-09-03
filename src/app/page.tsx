import { getAllSnapshots } from "@/lib/pipeline/store";
import { MODULE_KEYS } from "@/lib/pipeline/schema";
import { BreakdownCard } from "@/components/breakdown-card";
import { QuestionSearch } from "@/components/question-search";

export const revalidate = 300;

const CARD_META: Record<string, { href: string; accent: string }> = {
  [MODULE_KEYS.rbiRates]: { href: "/rates", accent: "pop-blue" },
  [MODULE_KEYS.rbiForex]: { href: "/reserves", accent: "pop-teal" },
  [MODULE_KEYS.unionBudget]: { href: "/budget", accent: "pop-red" },
};

export default async function Home() {
  const snapshots = await getAllSnapshots();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative pt-12 pb-10 sm:pt-16">
        <span className="sticker rotate-[-3deg]">🇮🇳 Public data, made human</span>
        <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-wide sm:text-7xl">
          Government data,
          <br />
          <span className="text-pop-red">decoded.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          Fresh central-government releases — RBI rates, forex reserves, the
          Union Budget — turned into clean, readable numbers the moment they
          drop. No 400-page PDFs. No login. No paywall.
        </p>

        <div className="mt-8 max-w-2xl">
          <QuestionSearch />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="sticker">🔓 No login</span>
          <span className="sticker">🧾 Every number sourced</span>
          <span className="sticker">⚡ Custom pipelines, no lag</span>
        </div>
      </section>

      {/* Live breakdowns */}
      <section className="pb-8">
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
      <section className="pb-8">
        <div className="pop-card bg-pop-yellow p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">
            The problem isn&rsquo;t missing data. It&rsquo;s missing translation.
          </h2>
          <p className="mt-3 max-w-3xl">
            India&rsquo;s government publishes an enormous amount of data — but
            it lands locked in PDFs and ugly spreadsheets, and by the time
            anyone parses it, the news cycle is over. infojunta takes those
            fresh releases and makes them visible and transparent, instantly.
          </p>
        </div>
      </section>
    </div>
  );
}
