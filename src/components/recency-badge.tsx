import { formatDate, isStale, timeAgo } from "@/lib/format";
import type { Cadence } from "@/lib/pipeline/schema";

const CADENCE_LABEL: Record<Cadence, string> = {
  realtime: "Live",
  daily: "Daily",
  weekly: "Weekly",
  annual: "Annual",
};

/** Sticker showing how fresh the data is + its as-of date. */
export function RecencyBadge({
  asOfDate,
  cadence,
  stale,
}: {
  asOfDate: string;
  cadence: Cadence;
  stale?: boolean;
}) {
  // Stale if we explicitly fell back to cache, OR the data's own date is too
  // old for its cadence. Either way we say so in words — never a green "Live"
  // sticker on days-old numbers.
  const isCached = Boolean(stale) || isStale(asOfDate, cadence);
  const label = isCached ? "Cached" : CADENCE_LABEL[cadence];

  return (
    <span
      className="sticker"
      title={
        isCached
          ? `Showing cached data, as of ${formatDate(asOfDate)}`
          : `Live · as of ${formatDate(asOfDate)}`
      }
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          isCached ? "bg-flat" : "bg-pop-green"
        }`}
        aria-hidden
      />
      {label} · as of {formatDate(asOfDate)}
      <span className="text-ink-soft normal-case">({timeAgo(asOfDate)})</span>
    </span>
  );
}
