"use client";

import { useMemo, useState } from "react";
import { formatIndian } from "@/lib/format";
import { colorFor } from "@/lib/colors";
import { track } from "@/lib/mixpanel";

type PaiseItem = { label: string; paise: number; colorKey: string };
type Ministry = { name: string; crore: number; colorKey: string; note?: string };

export type BudgetData = {
  fiscalYear: string;
  totalExpenditureCr: number;
  capexCr: number;
  fiscalDeficitPctGdp: number;
  comesFrom: PaiseItem[];
  goesTo: PaiseItem[];
  ministries: Ministry[];
};

const LAKH_CR = 100_000; // crore -> lakh crore

/** Format a value already in ₹ crore. */
function fmtCrore(cr: number): string {
  if (cr >= LAKH_CR) return `₹${(cr / LAKH_CR).toFixed(2)} L cr`;
  return `₹${formatIndian(Math.round(cr))} cr`;
}

/** Format a plain rupee amount (Your Share). */
function fmtRupees(a: number): string {
  if (a >= 1e7) return `₹${(a / 1e7).toFixed(2)} cr`;
  if (a >= 1e5) return `₹${(a / 1e5).toFixed(2)} L`;
  return `₹${formatIndian(Math.round(a))}`;
}

type View = "story" | "explore" | "share";

export function BudgetExplorer({ data }: { data: BudgetData }) {
  const [view, setView] = useState<View>("story");

  const totalLakhCr = data.totalExpenditureCr / LAKH_CR;

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["story", "Story"],
            ["explore", "Explore"],
            ["share", "Your share"],
          ] as [View, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setView(key);
              track("budget_view", { view: key });
            }}
            className={`pop-btn py-2! text-sm! ${view === key ? "" : "pop-btn-surface"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {view === "story" && <Story data={data} totalLakhCr={totalLakhCr} />}
        {view === "explore" && <Explore data={data} />}
        {view === "share" && <YourShare data={data} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Story */

function Story({ data, totalLakhCr }: { data: BudgetData; totalLakhCr: number }) {
  const topSource = data.comesFrom[0];
  const interest = data.goesTo.find((g) => /interest/i.test(g.label));
  const states = data.goesTo.find((g) => /states/i.test(g.label));
  const topMinistry = data.ministries.find((m) => !/finance/i.test(m.name));
  const interestCr = interest ? (interest.paise / 100) * data.totalExpenditureCr : 0;

  const panels = [
    {
      big: `₹${totalLakhCr.toFixed(1)} lakh cr`,
      text: `is what the central government plans to spend in ${data.fiscalYear} — every scheme, salary, subsidy and interest bill put together.`,
      color: "pop-blue",
    },
    {
      big: `${topSource.paise} paise`,
      text: `of every rupee it spends is borrowed money (${topSource.label.toLowerCase()}). The government spends more than it earns — that gap is the fiscal deficit, targeted at ${data.fiscalDeficitPctGdp}% of GDP.`,
      color: "pop-red",
    },
    {
      big: `${interest?.paise ?? 0} paise`,
      text: `of every rupee just pays interest on past debt — about ${fmtCrore(interestCr)} this year. It's the price of years of borrowing, before a single new road or school.`,
      color: "pop-purple",
    },
    {
      big: `${states?.paise ?? 0} paise`,
      text: `of every rupee goes straight to the states as their share of taxes — the single largest slice, because India runs on cooperative federalism.`,
      color: "pop-teal",
    },
    topMinistry
      ? {
          big: fmtCrore(topMinistry.crore),
          text: `goes to ${topMinistry.name} — the biggest-spending ministry (after the Finance ministry, which mostly routes interest and transfers).`,
          color: "pop-pink",
        }
      : null,
  ].filter(Boolean) as { big: string; text: string; color: string }[];

  return (
    <div className="space-y-4">
      {panels.map((p, i) => (
        <div key={i} className="pop-card flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
          <div
            className="on-pop shrink-0 rounded-xl border-[3px] border-ink px-4 py-3 text-center font-[family-name:var(--font-heading)] text-2xl shadow-[3px_3px_0_var(--color-ink)] sm:w-56"
            style={{ background: colorFor(p.color) }}
          >
            {p.big}
          </div>
          <p className="text-lg leading-snug">{p.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Explore */

type ExploreTab = "goesTo" | "comesFrom" | "ministries";

function Explore({ data }: { data: BudgetData }) {
  const [tab, setTab] = useState<ExploreTab>("goesTo");
  const [open, setOpen] = useState<string | null>(null);

  const tabs: [ExploreTab, string][] = [
    ["goesTo", "Where it goes"],
    ["comesFrom", "Where it comes from"],
    ["ministries", "By ministry"],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setOpen(null);
            }}
            className={`rounded-full border-[2.5px] border-ink px-3 py-1.5 text-xs font-[family-name:var(--font-heading)] shadow-[2px_2px_0_var(--color-ink)] ${
              tab === key ? "bg-pop-yellow on-pop" : "bg-surface text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ministries" ? (
        <MinistryList data={data} open={open} setOpen={setOpen} />
      ) : (
        <PaiseList
          items={tab === "goesTo" ? data.goesTo : data.comesFrom}
          total={data.totalExpenditureCr}
          noun={tab === "goesTo" ? "spent" : "received"}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
}

function PaiseList({
  items,
  total,
  noun,
  open,
  setOpen,
}: {
  items: PaiseItem[];
  total: number;
  noun: string;
  open: string | null;
  setOpen: (v: string | null) => void;
}) {
  const max = Math.max(...items.map((i) => i.paise));
  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const amountCr = (it.paise / 100) * total;
        const isOpen = open === it.label;
        return (
          <li key={it.label} className="pop-card-sm overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : it.label)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{it.label}</span>
                <span className="font-[family-name:var(--font-mono)] font-bold">{it.paise}p / ₹1</span>
              </div>
              <div className="mt-2 h-4 w-full overflow-hidden rounded border-2 border-ink bg-surface">
                <div
                  className="h-full"
                  style={{ width: `${(it.paise / max) * 100}%`, background: colorFor(it.colorKey) }}
                />
              </div>
              {isOpen && (
                <p className="mt-3 font-[family-name:var(--font-mono)] text-sm text-ink-soft">
                  That&rsquo;s {fmtCrore(amountCr)} {noun} in 2025-26 — {it.paise}% of the total.
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MinistryList({
  data,
  open,
  setOpen,
}: {
  data: BudgetData;
  open: string | null;
  setOpen: (v: string | null) => void;
}) {
  const max = Math.max(...data.ministries.map((m) => m.crore));
  return (
    <ul className="space-y-2.5">
      {data.ministries.map((m) => {
        const share = (m.crore / data.totalExpenditureCr) * 100;
        const isOpen = open === m.name;
        return (
          <li key={m.name} className="pop-card-sm overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : m.name)} className="w-full p-4 text-left">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{m.name}</span>
                <span className="font-[family-name:var(--font-mono)] font-bold">{fmtCrore(m.crore)}</span>
              </div>
              <div className="mt-2 h-4 w-full overflow-hidden rounded border-2 border-ink bg-surface">
                <div
                  className="h-full"
                  style={{ width: `${(m.crore / max) * 100}%`, background: colorFor(m.colorKey) }}
                />
              </div>
              {isOpen && (
                <p className="mt-3 text-sm text-ink-soft">
                  {share.toFixed(1)}% of total central spending.
                  {m.note ? ` ${m.note}` : ""}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------- Your Share */

const MIN = 5_000;
const MAX = 50_000_000; // ₹5 crore
const PRESETS = [50_000, 500_000, 2_500_000, 10_000_000];

function YourShare({ data }: { data: BudgetData }) {
  const [amount, setAmount] = useState(100_000);
  const clamped = Math.min(MAX, Math.max(MIN, amount || 0));

  const rows = useMemo(
    () =>
      data.goesTo
        .map((g) => ({ ...g, amount: (g.paise / 100) * clamped }))
        .sort((a, b) => b.amount - a.amount),
    [data.goesTo, clamped],
  );
  const max = Math.max(...rows.map((r) => r.amount));

  return (
    <div className="pop-card p-6">
      <h3 className="font-[family-name:var(--font-heading)] text-xl">
        Put in an amount — see where it goes
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Enter any figure from ₹5,000 to ₹5 crore. We split it the way the government actually
        spends each rupee (Budget {data.fiscalYear}). This is a share, not a tax calculation.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl border-[3px] border-ink bg-surface px-3 py-2 shadow-[3px_3px_0_var(--color-ink)]">
          <span className="mr-1 font-[family-name:var(--font-heading)] text-xl">₹</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-40 bg-transparent font-[family-name:var(--font-heading)] text-xl outline-none"
          />
        </div>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`rounded-full border-[2.5px] border-ink px-3 py-1 text-xs font-[family-name:var(--font-heading)] shadow-[2px_2px_0_var(--color-ink)] ${
              clamped === p ? "bg-pop-yellow on-pop" : "bg-surface text-ink"
            }`}
          >
            {fmtRupees(p)}
          </button>
        ))}
      </div>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={1000}
        value={clamped}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-5 w-full accent-pop-pink"
      />

      {amount !== clamped && (
        <p className="mt-2 text-xs text-down">
          Keeping it within ₹5,000–₹5 crore (showing {fmtRupees(clamped)}).
        </p>
      )}

      <ul className="mt-6 space-y-2.5">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="font-[family-name:var(--font-mono)] font-bold">
                {fmtRupees(r.amount)}{" "}
                <span className="text-ink-soft">({r.paise}%)</span>
              </span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-md border-[2.5px] border-ink bg-surface">
              <div
                className="h-full"
                style={{ width: `${Math.max(2, (r.amount / max) * 100)}%`, background: colorFor(r.colorKey) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
