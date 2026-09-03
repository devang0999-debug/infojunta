import { colorFor } from "@/lib/colors";
import { formatValue } from "@/lib/format";
import type { BreakdownItem } from "@/lib/pipeline/schema";

/**
 * Hand-built SVG donut — thick comic ink ring, no chart library. Server-safe.
 * `share` values are treated as percentages of the whole.
 */
export function DonutChart({
  items,
  centerTop,
  centerBottom,
}: {
  items: BreakdownItem[];
  centerTop?: string;
  centerBottom?: string;
}) {
  const size = 240;
  const stroke = 40;
  const r = (size - stroke) / 2 - 4; // leave room for the outline
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  let offset = 0;
  const arcs = items.map((it) => {
    const share = it.share ?? 0;
    const len = (share / 100) * C;
    const arc = {
      color: colorFor(it.colorKey),
      dash: `${len} ${C - len}`,
      dashoffset: -offset,
    };
    offset += len;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Composition donut chart"
        className="shrink-0"
      >
        {/* outer + inner ink outlines */}
        <circle cx={cx} cy={cy} r={r + stroke / 2} fill="none" stroke="var(--color-ink)" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={r - stroke / 2} fill="none" stroke="var(--color-ink)" strokeWidth={3} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dash}
              strokeDashoffset={a.dashoffset}
            />
          ))}
        </g>
        {(centerTop || centerBottom) && (
          <g>
            {centerTop && (
              <text
                x={cx}
                y={cy - 2}
                textAnchor="middle"
                className="font-[family-name:var(--font-heading)]"
                fontSize="22"
                fill="var(--color-ink)"
              >
                {centerTop}
              </text>
            )}
            {centerBottom && (
              <text
                x={cx}
                y={cy + 18}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-ink-soft)"
              >
                {centerBottom}
              </text>
            )}
          </g>
        )}
      </svg>

      <ul className="w-full space-y-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3 text-sm">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded border-2 border-ink"
              style={{ background: colorFor(it.colorKey) }}
              aria-hidden
            />
            <span className="flex-1">{it.label}</span>
            <span className="font-[family-name:var(--font-mono)] font-bold">
              {formatValue(it.value, it.unit)}
            </span>
            {it.share != null && (
              <span className="w-12 text-right text-ink-soft">{it.share}%</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
