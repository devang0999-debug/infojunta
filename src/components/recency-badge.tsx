import { formatDate, timeAgo } from "@/lib/format";
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
  return (
    <span className="sticker" title={`As of ${formatDate(asOfDate)}`}>
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          stale ? "bg-flat" : "bg-pop-green"
        }`}
        aria-hidden
      />
      {CADENCE_LABEL[cadence]} · as of {formatDate(asOfDate)}
      <span className="text-ink-soft normal-case">({timeAgo(asOfDate)})</span>
    </span>
  );
}
