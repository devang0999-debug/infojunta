"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  searchQuestions,
  EXAMPLE_QUESTIONS,
  CATEGORY_META,
  type CivicQuestion,
} from "@/lib/questions";
import { track } from "@/lib/mixpanel";

/**
 * The hero: a search bank over the central question repository. Type a plain
 * question, get a plain answer + a link to the live breakdown.
 */
export function QuestionSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");

  const results = useMemo<CivicQuestion[]>(
    () => (query.trim().length >= 2 ? searchQuestions(query) : []),
    [query],
  );

  function runExample(q: string) {
    setQuery(q);
    track("question_example_clicked", { q });
  }

  return (
    <div className="w-full">
      <div className="speech p-3 sm:p-4">
        <label htmlFor="q" className="sr-only">
          Ask a question about government data
        </label>
        <div className="flex items-center gap-2">
          <svg
            className="ml-1 shrink-0 text-ink-soft"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="q"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() =>
              query.trim().length >= 2 &&
              track("question_searched", { q: query, results: results.length })
            }
            placeholder="Ask: What is the current repo rate?"
            className="w-full bg-transparent py-2 text-lg outline-none placeholder:text-ink-soft"
          />
        </div>
      </div>

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((r) => {
            const cat = CATEGORY_META[r.category];
            return (
              <li key={r.id} className="pop-card-sm p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="sticker"
                    style={{ background: "var(--color-paper-2)" }}
                  >
                    {cat.label}
                  </span>
                  <span className="font-[family-name:var(--font-heading)] text-base">
                    {r.q}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{r.answer}</p>
                <Link
                  href={r.link.href}
                  onClick={() =>
                    track("question_result_clicked", { id: r.id, to: r.link.href })
                  }
                  className="mt-2 inline-block font-[family-name:var(--font-heading)] text-sm text-pop-blue hover:underline"
                >
                  {r.link.label} →
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {results.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wide text-ink-soft">
            Try:
          </span>
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => runExample(q)}
              className="pop-btn pop-btn-surface py-1.5! text-xs!"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
