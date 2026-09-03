import { formatDate } from "@/lib/format";
import type { Provenance as ProvenanceType } from "@/lib/pipeline/schema";
import { SourceLink } from "./tracked-link";

/**
 * The transparency strip. This is the whole product ethos on the page: every
 * number carries where it came from and when it was pulled.
 */
export function Provenance({
  provenance,
  moduleKey,
}: {
  provenance: ProvenanceType;
  moduleKey?: string;
}) {
  return (
    <div className="pop-card-sm p-4 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-wide text-ink-soft">
          Source
        </span>
        <SourceLink
          href={provenance.sourceUrl}
          moduleKey={moduleKey}
          className="font-medium underline decoration-pop-blue decoration-2 underline-offset-2 hover:text-pop-blue"
        >
          {provenance.sourceName} ↗
        </SourceLink>
      </div>
      {provenance.note && (
        <p className="mt-1 text-ink-soft">{provenance.note}</p>
      )}
      <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-ink-soft">
        pulled {formatDate(provenance.fetchedAt)}
      </p>
    </div>
  );
}
