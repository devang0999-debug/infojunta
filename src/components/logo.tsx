import Link from "next/link";

/**
 * Wordmark: a pink question-mark tile (nods to the question bank) + the
 * "kya haal junta?" wordmark in heavy grotesque. Theme-independent tile so the
 * brand stays constant in light and dark.
 */
export function Logo({
  size = "md",
  href = "/",
  tone = "auto",
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  /** "auto" = themeable text (surfaces); "dark" = fixed dark (bright bars). */
  tone?: "auto" | "dark";
}) {
  const tile =
    size === "lg" ? "h-12 w-12 text-2xl" : size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-xl";
  const word =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl sm:text-2xl";
  const base = tone === "dark" ? "text-on-pop" : "text-ink";

  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid ${tile} place-items-center rounded-[9px] bg-pop-pink font-[family-name:var(--font-heading)] text-white shadow-[var(--shadow-sm)] ring-1 ring-black/10`}
        aria-hidden
      >
        ?
      </span>
      <span
        className={`font-[family-name:var(--font-heading)] ${word} leading-none tracking-tight ${base}`}
      >
        kya haal <span className="text-pop-pink">junta?</span>
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="kya haal junta? — home" className="inline-flex">
      {inner}
    </Link>
  );
}
