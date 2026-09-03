import bank from "@/data/question-bank.json";

export type QuestionCategory =
  | "rates"
  | "reserves"
  | "budget"
  | "municipal"
  | "tax";

export type QuestionScope = "central" | "municipal";

export interface CivicQuestion {
  id: string;
  q: string;
  category: QuestionCategory;
  scope: QuestionScope;
  tags: string[];
  answer: string;
  link: { href: string; label: string };
  source?: { name: string; url: string };
}

export const QUESTIONS: CivicQuestion[] = (bank.questions as CivicQuestion[]);

export const CATEGORY_META: Record<
  QuestionCategory,
  { label: string; colorKey: string }
> = {
  rates: { label: "RBI Rates", colorKey: "pop-blue" },
  reserves: { label: "Forex Reserves", colorKey: "pop-teal" },
  budget: { label: "Union Budget", colorKey: "pop-red" },
  tax: { label: "Tax", colorKey: "pop-purple" },
  municipal: { label: "Municipal", colorKey: "pop-yellow" },
};

/**
 * Tiny, dependency-free scored search over the central question bank. Matches
 * on the question text and tags; ranks exact/prefix hits above loose ones.
 */
export function searchQuestions(query: string, limit = 8): CivicQuestion[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (terms.length === 0) return [];

  const scored = QUESTIONS.map((item) => {
    const haystack = (item.q + " " + item.tags.join(" ")).toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) score += 2;
      if (item.q.toLowerCase().startsWith(term)) score += 3;
      if (item.tags.some((t) => t.toLowerCase() === term)) score += 3;
    }
    return { item, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.item);
}

export const EXAMPLE_QUESTIONS = [
  "What is the current RBI repo rate?",
  "How much are India's forex reserves?",
  "Where does my tax rupee go?",
  "What is the fiscal deficit target?",
];
