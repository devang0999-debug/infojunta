"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/mixpanel";

/** Triggers the live pipeline for one module, then refreshes the page data. */
export function RefreshButton({ moduleKey }: { moduleKey: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function refresh() {
    setState("loading");
    track("refresh_triggered", { module: moduleKey });
    try {
      const res = await fetch(`/api/refresh/${moduleKey}`, { method: "POST" });
      const json = await res.json();
      setState(json.ok ? "ok" : "err");
      router.refresh();
    } catch {
      setState("err");
    } finally {
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const label =
    state === "loading"
      ? "Pulling…"
      : state === "ok"
        ? "Updated ✓"
        : state === "err"
          ? "Source unavailable"
          : "Pull latest";

  return (
    <button onClick={refresh} disabled={state === "loading"} className="pop-btn pop-btn-surface">
      {state !== "loading" && <span aria-hidden>↻</span>}
      {label}
    </button>
  );
}
