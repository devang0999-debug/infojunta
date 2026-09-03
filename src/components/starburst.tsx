import { colorFor } from "@/lib/colors";

/** Comic starburst badge with an ink outline (via a slightly larger black burst behind). */
export function Starburst({
  children,
  colorKey = "pop-pink",
  rotate = 0,
}: {
  children: React.ReactNode;
  colorKey?: string;
  rotate?: number;
}) {
  return (
    <div
      className="relative grid h-24 w-24 place-items-center"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* ink outline */}
      <span className="burst absolute inset-0 bg-ink" aria-hidden />
      {/* colour fill */}
      <span
        className="burst absolute inset-[3px]"
        style={{ background: colorFor(colorKey) }}
        aria-hidden
      />
      <span className="relative z-10 px-2 text-center font-[family-name:var(--font-heading)] text-xs leading-tight text-on-pop">
        {children}
      </span>
    </div>
  );
}
