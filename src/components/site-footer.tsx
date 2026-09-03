import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-ink bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <Logo size="sm" href={null} />
        <p className="mt-3 max-w-2xl text-ink-soft">
          Fresh Indian central-government releases, translated into clean,
          readable data. No login. No paywall. Every number links back to its
          official source.
        </p>
        <p className="mt-4 text-xs text-ink-soft">
          Data belongs to its publishers (RBI, Ministry of Finance). We only make
          it readable. Figures may carry a reporting lag — always check the
          &ldquo;as of&rdquo; date and the source link.
        </p>
      </div>
    </footer>
  );
}
