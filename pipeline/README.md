# Python data pipeline

A standalone Python implementation of the scrapers, mirroring
`src/lib/pipeline/` in TypeScript. Both write the **same** normalized snapshot
JSON that the Next.js app reads, so you can refresh data with either stack.

Reports everything in **INR** (forex reserves in ₹ lakh crore, from the WSS
₹-crore column).

## Run

```bash
cd pipeline
python -m venv .venv && source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt

python run.py                    # refresh all
python run.py rbi-policy-rates   # one module
python run.py rbi-forex-reserves
```

Output is written to `../src/data/snapshots/<module>.json`.

## Modules

| File | Source | Notes |
| --- | --- | --- |
| `rbi_rates.py` | RBI homepage `#wrapper` rates box | repo, reverse repo, SDF, MSF, bank rate, CRR, SLR, ₹/USD |
| `rbi_forex.py` | RBI Weekly Statistical Supplement (two-hop) | Total/FCA/Gold/SDRs/IMF in ₹ lakh crore + weekly change |
| `fetch.py` | — | shared fetch + tolerant number parsing |
| `run.py` | — | runner that writes snapshots |

## Scheduling (optional)

A GitHub Action can run `python run.py` on a schedule and commit the refreshed
JSON — that keeps the deployed site's data current without a database, since
each commit triggers a redeploy. Ask and it can be wired up.
