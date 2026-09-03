# infojunta

**Government data, decoded.**

infojunta takes fresh Indian central-government releases — RBI policy rates,
foreign exchange reserves, the Union Budget — and turns them into clean,
readable, transparent numbers the moment they drop. No 400-page PDFs. No login.
No paywall. Every number links back to its official source.

> The problem was never a lack of data. India's government publishes an enormous
> amount of it. The problem is **translation** — raw releases land locked in PDFs
> and ugly spreadsheets, and by the time anyone parses them, the news cycle is
> over. infojunta is the translation layer.

## What's live

| Breakdown | Source | Cadence |
| --- | --- | --- |
| **RBI Policy Rates** — repo, reverse repo, MSF, SDF, bank rate, CRR, SLR, ₹/USD | RBI homepage (FBIL) | live scrape |
| **Forex Reserves** — total, FCA, gold, SDRs, IMF position + weekly change | RBI Weekly Statistical Supplement | weekly scrape |
| **Union Budget 2025-26** — where the rupee comes from / goes to | Budget at a Glance | annual, verified snapshot |
| **Question bank** — central, searchable repository of civic questions | seeded + extensible | — |

## How it works

Every source — however messy — collapses into one **normalized snapshot**
shape (`src/lib/pipeline/schema.ts`). The UI never cares whether a number came
from a live HTML scrape or a verified dataset; it only renders that shape.

```
fetch (custom scraper) → parse (cheerio) → normalize → persist (Supabase)
                                                     ↘ committed JSON fallback
```

We run our **own** pipeline end-to-end (no third-party data aggregator in the
middle) so there's no added lag between a release and our breakdown. If a scrape
fails or Supabase isn't configured, the app serves the last committed snapshot —
it never shows a blank page.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (public read) ·
Mixpanel · Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — the app runs without keys
npm run dev
```

Open the local URL it prints. Trigger a live pull:

```bash
curl http://localhost:3000/api/refresh/rbi-policy-rates
curl http://localhost:3000/api/refresh/rbi-forex-reserves
curl http://localhost:3000/api/refresh/all
```

The app works with **no** environment variables (committed fallback data +
no-op analytics). Add Supabase + Mixpanel keys to enable live persistence,
history and tracking — see `.env.example` and `supabase/schema.sql`.

## Project layout

```
src/
  app/                 landing, /rates, /reserves, /budget, /ask, /api/refresh
  components/          comic-pop UI + charts (hand-built SVG)
  lib/
    pipeline/          schema, fetch, sources/*, registry, store, fallback
    supabase/          anon + service-role clients (both no-op if unset)
    questions.ts       central question-bank search
    mixpanel.ts
  data/                verified datasets + committed snapshot fallbacks
supabase/schema.sql    tables + row-level security (public read only)
docs/                  architecture & data-source notes
design-refs/           drop design screenshots here for pixel-matching
```

## Design

A "comic pop" system — bold ink outlines, hard offset shadows, halftone dots,
punchy pop primaries on warm paper. Tokens live in `src/app/globals.css`.

## Roadmap

- Ingest public **municipal** data + questions into the central repository.
- A "where your tax rupees go" income → expenditure calculator.
- Trend charts from `snapshot_history`.
- More RBI feeds already in the homepage box (G-Sec yields, T-bills, deposit rates).

## Licence

MIT — see [LICENSE](./LICENSE). Underlying data belongs to its publishers
(RBI, Ministry of Finance); infojunta only makes it readable.
