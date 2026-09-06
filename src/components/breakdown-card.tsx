import Link from "next/link";
import { formatValue } from "@/lib/format";
import { colorFor } from "@/lib/colors";
import type { NormalizedSnapshot } from "@/lib/pipeline/schema";
import { RecencyBadge } from "./recency-badge";

/** A single source, summarised, on the landing grid. Links to its full page. */
export function BreakdownCard({
  snapshot,
  href,
  accentColorKey = "pop-blue",
}: {
  snapshot: NormalizedSnapshot;
  href: string;
  accentColorKey?: string;
}) {
  const headline = snapshot.metrics[0];
  return (
    <Link
      href={href}
      className="pop-card group flex flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-edge-strong"
    >
      <div
        className="mb-3 h-1.5 w-12 rounded-full"
        style={{ background: colorFor(accentColorKey) }}
        aria-hidden
      />
      <h3 className="font-[family-name:var(--font-heading)] text-xl leading-tight">
        {snapshot.title}
      </h3>

      {headline && (
        <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-none">
          {formatValue(headline.value, headline.unit)}
          {headline.changeLabel && (
            <span
              className={`ml-2 align-middle font-[family-name:var(--font-mono)] text-xs ${
                headline.direction === "down" ? "text-down" : "text-up"
              }`}
            >
              {headline.changeLabel}
            </span>
          )}
        </p>
      )}

      <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-soft">
        {snapshot.plainSummary}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <RecencyBadge
          asOfDate={snapshot.asOfDate}
          cadence={snapshot.cadence}
          stale={snapshot.stale}
        />
        <span className="font-[family-name:var(--font-heading)] text-sm text-pop-blue group-hover:underline">
          Break it down →
        </span>
      </div>
    </Link>
  );
}
