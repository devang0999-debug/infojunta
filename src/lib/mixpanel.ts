import mixpanel from "mixpanel-browser";

/**
 * Thin Mixpanel wrapper. Safe no-op when no token is set, so tracking never
 * breaks the page and local dev works without analytics keys.
 */
const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

export const isAnalyticsEnabled = Boolean(TOKEN);

let initialized = false;

export function initMixpanel() {
  if (initialized || !TOKEN || typeof window === "undefined") return;
  mixpanel.init(TOKEN, {
    track_pageview: false,
    persistence: "localStorage",
    ignore_dnt: false,
  });
  initialized = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!TOKEN || typeof window === "undefined") return;
  try {
    mixpanel.track(event, props);
  } catch {
    // never let analytics throw into the UI
  }
}
