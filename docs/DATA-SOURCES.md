# Data sources

Only sources where **live, structured data can actually be pulled** from Indian
government sites are included. Reality: most releases are PDFs — these are the
exceptions worth building a pipeline on.

## RBI Policy Rates — ✅ live

- **URL:** https://www.rbi.org.in/ (the "Current Rates" `#wrapper` box)
- **Shape:** server-rendered HTML tables: `<tr><th>rate</th><td>: value%</td></tr>`.
- **What we take:** repo, reverse repo, SDF, MSF, bank rate, CRR, SLR, ₹/USD.
- **Bonus available:** the same box carries G-Sec yields, T-bills, deposit
  rates, Sensex/Nifty — easy future metrics.
- **Cadence:** changes on MPC decisions; we poll daily.
- **Timestamp:** "As at … (Source: FBIL)" → our `asOfDate`.

## RBI Forex Reserves — ✅ live (two-hop)

- **Listing:** https://www.rbi.org.in/scripts/WSSViewDetail.aspx?TYPE=Section&PARAM1=2
- **Table:** the latest `WSSView.aspx?Id=NNNNN` "Foreign Exchange Reserves".
- **What we take:** Total, FCA, Gold, SDRs, IMF position — in **₹ (lakh crore)**
  using the WSS ₹-crore column, plus weekly variation. (The table also has a US$
  column; we present INR only.)
- **Gotcha:** RBI nests data tables inside layout tables → parse with
  `.children("td")`, not `.find("td")`.
- **Cadence:** weekly (published Fridays, ~1-week reporting lag).

## Union Budget — ⚠️ verified snapshot

- **URL:** https://www.indiabudget.gov.in/ (Budget at a Glance)
- **Why not scraped:** annual, PDF/Excel only. Pretending it's a weekly scrape
  would be dishonest.
- **What we take:** total expenditure, capex, fiscal deficit, the paise-per-
  rupee "comes from / goes to" split, and ministry-wise allocations
  (`data/union-budget.json`). Currently FY2026-27 (₹53.47 lakh cr total,
  fiscal deficit 4.3% of GDP).
- **Refresh:** update the dataset each February on budget day, source cited.
  Ministry figures are as-reported (exact table lives in the PRS/Expenditure PDF).

## Municipal — 🔜 roadmap

Every city runs its own portal with its own format. The central question
repository is seeded with municipal questions and structured to ingest these as
per-city scrapers are built.
