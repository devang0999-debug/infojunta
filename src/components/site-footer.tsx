export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-ink bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <p className="font-[family-name:var(--font-heading)] text-lg">
          info<span className="text-pop-red">junta</span>
        </p>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Fresh Indian central-government releases, translated into clean,
          readable data. No login. No paywall. Every number links back to its
          official source.
        </p>
        <p className="mt-4 text-xs text-ink-soft">
          Data belongs to its publishers (RBI, Ministry of Finance). infojunta
          only makes it readable. Figures may carry a reporting lag — always
          check the &ldquo;as of&rdquo; date and the source link.
        </p>
      </div>
    </footer>
  );
}
