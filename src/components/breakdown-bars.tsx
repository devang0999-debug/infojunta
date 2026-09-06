import { colorFor } from "@/lib/colors";
import type { BreakdownItem } from "@/lib/pipeline/schema";

/** Comic horizontal bars for a share breakdown (e.g. the rupee, sliced up). */
export function BreakdownBars({
  items,
  valueSuffix,
}: {
  items: BreakdownItem[];
  valueSuffix?: string;
}) {
  const max = Math.max(...items.map((i) => i.share ?? i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const magnitude = it.share ?? it.value;
        const pct = Math.max(2, (magnitude / max) * 100);
        return (
          <li key={it.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">{it.label}</span>
              <span className="font-[family-name:var(--font-mono)] font-bold">
                {magnitude}
                {valueSuffix ?? (it.unit ? ` ${it.unit}` : "")}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: colorFor(it.colorKey) }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
