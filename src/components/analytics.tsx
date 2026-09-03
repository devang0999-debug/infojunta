"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, track } from "@/lib/mixpanel";

/** Boots Mixpanel and logs a page_viewed event on every route change. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    initMixpanel();
  }, []);

  useEffect(() => {
    track("page_viewed", { path: pathname });
  }, [pathname]);

  return null;
}
