"""Export a small, public JSON that the embeddable widgets consume.

Reads the latest committed snapshots + the budget dataset and writes
public/embed/data.json — the file public/embed/widget.js fetches. Run after a
refresh so embeds stay in sync with the site.
"""
from __future__ import annotations

import json
import pathlib
from datetime import date

import budget as budget_mod

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNAP_DIR = ROOT / "src" / "data" / "snapshots"
OUT = ROOT / "public" / "embed" / "data.json"
SITE = "https://infojunta.vercel.app"


def _load_snapshot(key: str) -> dict | None:
    path = SNAP_DIR / f"{key}.json"
    if not path.exists():
        return None
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def _metric(snap: dict | None, key: str):
    if not snap:
        return None
    for m in snap.get("metrics", []):
        if m["key"] == key:
            return m
    return None


def build_embed() -> dict:
    rates = _load_snapshot("rbi-policy-rates")
    forex = _load_snapshot("rbi-forex-reserves")
    bud = budget_mod.load_dataset()

    repo = _metric(rates, "repo")
    crr = _metric(rates, "crr")
    slr = _metric(rates, "slr")
    total = _metric(forex, "total")

    return {
        "updated": date.today().isoformat(),
        "site": SITE,
        "rates": {
            "repo": repo["value"] if repo else None,
            "crr": crr["value"] if crr else None,
            "slr": slr["value"] if slr else None,
            "unit": "%",
            "asOf": (rates or {}).get("asOfDate", "")[:10],
            "source": "Reserve Bank of India",
        },
        "forex": {
            "total": total["value"] if total else None,
            "unit": "₹ lakh cr",
            "changeLabel": total.get("changeLabel") if total else None,
            "direction": total.get("direction") if total else "up",
            "asOf": (forex or {}).get("asOfDate", "")[:10],
            "source": "RBI Weekly Statistical Supplement",
        },
        "budget": {
            "fiscalYear": bud["fiscalYear"],
            "totalLakhCr": round(bud["totalExpenditureCr"] / 100_000, 2),
            "deficitPctGdp": bud["fiscalDeficitPctGdp"],
            "goesTo": [{"label": g["label"], "paise": g["paise"]} for g in bud["goesTo"]],
            "source": f"Union Budget {bud['fiscalYear']}",
        },
    }


def main() -> int:
    data = build_embed()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
