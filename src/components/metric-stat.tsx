import { formatValue } from "@/lib/format";
import type { Metric } from "@/lib/pipeline/schema";

const ARROW = { up: "▲", down: "▼", flat: "—" } as const;
const DIR_COLOR = {
  up: "text-up",
  down: "text-down",
  flat: "text-flat",
} as const;

/** One big number in a comic card, with plain-language meaning and change. */
export function MetricStat({ metric }: { metric: Metric }) {
  const dir = metric.direction;
  return (
    <div className="pop-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-[family-name:var(--font-heading)] text-sm leading-tight text-ink-soft">
          {metric.label}
        </h3>
        {dir && metric.changeLabel && (
          <span
            className={`font-[family-name:var(--font-mono)] text-xs font-bold ${DIR_COLOR[dir]}`}
          >
            {ARROW[dir]} {metric.changeLabel}
          </span>
        )}
      </div>

      <p className="mt-2 font-[family-name:var(--font-heading)] text-4xl leading-none">
        {formatValue(metric.value, metric.unit)}
      </p>

      {metric.plain && (
        <p className="mt-3 text-sm text-ink-soft">{metric.plain}</p>
      )}
    </div>
  );
}
