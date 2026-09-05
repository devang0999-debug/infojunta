# Architecture

## The one idea

Any messy government source, in → one clean `NormalizedSnapshot`, out. The UI
only ever renders that shape, so adding a source is: write one module, register
it, done.

## The normalized snapshot

`src/lib/pipeline/schema.ts` defines it:

- `metrics[]` — headline numbers with plain-language meaning, previous value,
  change + direction.
- `breakdown[]` — parts of a whole (for donuts / bars), with `share`.
- `provenance` — source name, URL, fetched-at. This is non-negotiable: every
  page shows where its numbers came from and when.
- `stale` — true when we're serving committed fallback rather than fresh data.

## Sources (`src/lib/pipeline/sources/`)

| Module | Strategy | Notes |
| --- | --- | --- |
| `rbi-policy-rates` | Scrape the `#wrapper` rates box on the RBI homepage. | Reads the whole box into a name→value map, then picks the rates. Survives row re-ordering. |
| `rbi-forex-reserves` | Two-hop: fetch WSS section listing → take the **latest** `WSSView` link → parse the reserves table. | Never hardcodes a weekly URL. Uses `.children("td")` to avoid nested-table cell bleed. |
| `union-budget` | Read a verified snapshot dataset (`src/data/union-budget.json`, FY2026-27). | Annual release; refreshed each February. Not pretended to be live. |

`fetch.ts` sets a browser-ish User-Agent and timeout (gov sites are picky) and
tolerant number parsing (`₹ 50,65,345 crore` → number).

## Store & fallback (`store.ts`, `fallback.ts`)

- `getSnapshot(key)` — Supabase row first, committed fallback otherwise. Always
  renderable.
- `saveSnapshot(snap)` — upsert `snapshots` + append `snapshot_history` (if
  Supabase configured) **and** rewrite the committed JSON fallback (dev only;
  silently skipped on read-only hosts).
- `refreshModule(key)` — run a source, persist, return. Degrades to fallback on
  error.

This is why the app runs with **zero** environment variables: no Supabase → read
fallback; scrape fails → fallback with `stale: true`.

## Refresh trigger

`GET|POST /api/refresh/[module]` runs one module (or `all`). A Vercel Cron
(`vercel.json`) hits the RBI feeds daily/weekly in production.

## Question bank (`src/lib/questions.ts`)

A central repository of plain-language civic questions (`data/question-bank.json`),
each mapped to a live breakdown. Central-government questions resolve now;
municipal questions are seeded and structured to be back-filled as public city
portals are ingested. A dependency-free scored search powers the hero.

## Design system

Comic-pop tokens + component classes (`.pop-card`, `.pop-btn`, `.sticker`,
`.speech`, `.halftone`, `.burst`) live in `src/app/globals.css`. Charts are
hand-built SVG/CSS for full aesthetic control and zero chart-lib SSR risk.
