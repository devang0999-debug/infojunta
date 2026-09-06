"use client";

import { useEffect, useRef } from "react";
import { colorFor } from "@/lib/colors";
import { track } from "@/lib/mixpanel";

export type StoryPanel = {
  figure: string;
  unit?: string;
  title: string;
  body: string;
  colorKey: string;
  source?: string;
};

/**
 * Scroll-driven story: each panel fades/rises in as it enters the viewport.
 * Figures alternate side to side for rhythm. Falls back to fully-visible when
 * reduced-motion or no IntersectionObserver.
 */
export function StoryScroll({ panels }: { panels: StoryPanel[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = root.current?.querySelectorAll(".story-panel");
    if (!els) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            const idx = (e.target as HTMLElement).dataset.idx;
            if (idx) track("story_panel_seen", { idx: Number(idx) });
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.35 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root}>
      {panels.map((p, i) => (
        <section
          key={i}
          data-idx={i}
          className={`story-panel flex min-h-[58vh] items-center border-b border-edge py-10 ${
            i % 2 === 1 ? "justify-end text-right" : ""
          }`}
        >
          <div className="max-w-2xl">
            <div
              className="story-figure inline-block"
              style={{ color: colorFor(p.colorKey) }}
            >
              {p.figure}
              {p.unit && (
                <span className="ml-2 align-baseline text-[0.32em] text-ink">
                  {p.unit}
                </span>
              )}
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl">
              {p.title}
            </h2>
            <p className="mt-3 text-lg leading-snug text-ink-soft">{p.body}</p>
            {p.source && (
              <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-ink-soft">
                {p.source}
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
