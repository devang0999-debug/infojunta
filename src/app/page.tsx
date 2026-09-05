import Link from "next/link";
import budget from "@/data/union-budget.json";
import { getAllSnapshots, getSnapshot } from "@/lib/pipeline/store";
import { MODULE_KEYS } from "@/lib/pipeline/schema";
import { BreakdownCard } from "@/components/breakdown-card";
import { QuestionSearch } from "@/components/question-search";
import { StoryScroll, type StoryPanel } from "@/components/story-scroll";

export const revalidate = 300;

const CARD_META: Record<string, { href: string; accent: string }> = {
  [MODULE_KEYS.rbiRates]: { href: "/rates", accent: "pop-blue" },
  [MODULE_KEYS.rbiForex]: { href: "/reserves", accent: "pop-teal" },
  [MODULE_KEYS.unionBudget]: { href: "/budget", accent: "pop-red" },
};

export default async function Home() {
  const snapshots = await getAllSnapshots();
  const rates = await getSnapshot(MODULE_KEYS.rbiRates);
  const forex = await getSnapshot(MODULE_KEYS.rbiForex);

  const total = budget.totalExpenditureCr;
  const totalLakhCr = total / 100000;
  const borrow = budget.comesFrom[0].paise;
  const states = budget.goesTo[0].paise;
  const interest = budget.goesTo[1].paise;
  const interestLakhCr = (interest / 100) * totalLakhCr;
  const defence = budget.ministries.find((m) => m.name === "Defence");
  const defenceLakhCr = defence ? defence.crore / 100000 : 0;
  const repo = rates?.metrics.find((m) => m.key === "repo")?.value ?? "—";
  const forexTotal = forex?.metrics.find((m) => m.key === "total")?.value ?? "—";

  const panels: StoryPanel[] = [
    {
      figure: `₹${totalLakhCr.toFixed(1)}`,
      unit: "lakh crore",
      title: `India's ${budget.fiscalYear} spending plan`,
      body: "Every scheme, salary, subsidy and interest bill the central government plans to pay this year, in one number.",
      colorKey: "pop-blue",
      source: `Union Budget ${budget.fiscalYear} (Budget Estimates)`,
    },
    {
      figure: `${borrow}`,
      unit: "paise / ₹",
      title: "of every rupee is borrowed",
      body: `The government spends more than it earns. That gap — the fiscal deficit — is targeted at ${budget.fiscalDeficitPctGdp}% of GDP this year.`,
      colorKey: "pop-red",
    },
    {
      figure: `${interest}`,
      unit: "paise / ₹",
      title: "just pays interest on old debt",
      body: `About ₹${interestLakhCr.toFixed(1)} lakh crore goes to servicing past borrowing — before a single new road or school.`,
      colorKey: "pop-purple",
    },
    {
      figure: `${states}`,
      unit: "paise / ₹",
      title: "goes straight to the states",
      body: "The single largest slice — the states' share of central taxes. India runs on cooperative federalism.",
      colorKey: "pop-teal",
    },
    {
      figure: `₹${defenceLakhCr.toFixed(2)}`,
      unit: "lakh crore",
      title: "goes to Defence",
      body: "The biggest-spending ministry — about 15% of the budget, up over 15% on last year.",
      colorKey: "pop-pink",
      source: `Ministry allocations, ${budget.fiscalYear} (BE)`,
    },
    {
      figure: `${repo}`,
      unit: "%",
      title: "is the RBI repo rate",
      body: "The cost of money right now — it steers your loan EMIs and deposit returns. Pulled live from the RBI.",
      colorKey: "pop-yellow",
      source: "Reserve Bank of India · live",
    },
    {
      figure: `₹${forexTotal}`,
      unit: "lakh crore",
      title: "backs the rupee",
      body: "India's foreign exchange reserves — the war-chest that cushions the currency and pays for imports.",
      colorKey: "pop-green",
      source: "RBI Weekly Statistical Supplement",
    },
    {
      figure: `${budget.fiscalDeficitPctGdp}`,
      unit: "% of GDP",
      title: "is the fiscal deficit",
      body: "How much more the government spends than it earns, measured against the size of the whole economy.",
      colorKey: "pop-red",
      source: `Union Budget ${budget.fiscalYear}`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Compact hero */}
      <section className="pt-12 pb-6 sm:pt-16">
        <span className="sticker on-pop bg-pop-teal!">
          <span className="text-pop-red">●</span> Live · {budget.fiscalYear} · three official sources
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
          Government data, <span className="ink-outline italic">decoded.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          Scroll the story of India&rsquo;s money — the {budget.fiscalYear} Budget, RBI rates and
          reserves — in plain numbers. <span className="font-bold text-ink">No login. No paywall. Every figure sourced.</span>
        </p>
        <div className="mt-7 max-w-2xl">
          <QuestionSearch />
        </div>
        <p className="mt-8 font-[family-name:var(--font-heading)] text-sm text-ink-soft">
          The story ↓
        </p>
      </section>

      {/* The scrollable story */}
      <StoryScroll panels={panels} />

      {/* Go deeper */}
      <section className="pt-12 pb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">
          <span className="pop-underline">Go deeper</span>
        </h2>
        <p className="mt-2 text-ink-soft">
          Every figure in the story has a full breakdown — pulled straight from official sources.
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
        <div className="mt-6">
          <Link href="/budget" className="pop-btn pop-btn-pink">
            Explore the Budget & your share ↗
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="pb-12">
        <div className="pop-card on-pop bg-pop-yellow! p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">
            The problem isn&rsquo;t missing data. It&rsquo;s missing translation.
          </h2>
          <p className="mt-3 max-w-3xl">
            India&rsquo;s government publishes an enormous amount of data — but it lands locked in
            PDFs and ugly spreadsheets, and by the time anyone parses it, the news cycle is over.
            kya haal junta? takes those fresh releases and makes them visible and transparent,
            instantly.
          </p>
        </div>
      </section>
    </div>
  );
}
