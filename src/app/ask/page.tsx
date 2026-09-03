import type { Metadata } from "next";
import Link from "next/link";
import { QuestionSearch } from "@/components/question-search";
import {
  QUESTIONS,
  CATEGORY_META,
  type QuestionCategory,
} from "@/lib/questions";

export const metadata: Metadata = {
  title: "Ask — infojunta",
  description:
    "A central, searchable bank of plain-language questions about Indian public data — each mapped to a live breakdown.",
};

const ORDER: QuestionCategory[] = ["rates", "reserves", "budget", "tax", "municipal"];

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = ORDER.includes(category as QuestionCategory)
    ? (category as QuestionCategory)
    : null;

  const shown = active ? QUESTIONS.filter((q) => q.category === active) : QUESTIONS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <span className="sticker rotate-[-2deg]">❓ Question bank</span>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide sm:text-6xl">
        Ask anything
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        A central repository of the questions people actually ask about public
        data — each answered in plain language and linked to the live numbers.
        Municipal questions are seeded and being back-filled from public city
        portals.
      </p>

      <div className="mt-8">
        <QuestionSearch autoFocus />
      </div>

      {/* Category filters */}
      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          href="/ask"
          className={`pop-btn py-1.5! text-xs! ${active ? "bg-surface!" : ""}`}
        >
          All
        </Link>
        {ORDER.map((c) => (
          <Link
            key={c}
            href={`/ask?category=${c}`}
            className={`pop-btn py-1.5! text-xs! ${active === c ? "" : "bg-surface!"}`}
          >
            {CATEGORY_META[c].label}
          </Link>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {shown.map((q) => (
          <li key={q.id} className="pop-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="sticker" style={{ background: "var(--color-paper-2)" }}>
                {CATEGORY_META[q.category].label}
              </span>
              {q.scope === "municipal" && (
                <span className="sticker border-dashed!">seeded</span>
              )}
            </div>
            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-lg">
              {q.q}
            </h3>
            <p className="mt-2 text-ink-soft">{q.answer}</p>
            <Link
              href={q.link.href}
              className="mt-3 inline-block font-[family-name:var(--font-heading)] text-sm text-pop-blue hover:underline"
            >
              {q.link.label} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
