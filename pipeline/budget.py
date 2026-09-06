"""Union Budget module (Python) — mirrors the TypeScript buildBudgetSnapshot.

The Budget is an annual release (PDF/Excel), so this reads the verified,
source-cited dataset rather than scraping. Same normalized shape as the
scraped modules, reported strictly in INR.
"""
from __future__ import annotations

import json
import pathlib
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATASET = ROOT / "src" / "data" / "union-budget.json"
LAKH_CR = 100_000


def load_dataset() -> dict:
    with DATASET.open(encoding="utf-8") as fh:
        return json.load(fh)


def build_snapshot(budget: dict | None = None) -> dict:
    budget = budget or load_dataset()
    total = budget["totalExpenditureCr"]
    total_lakh = total / LAKH_CR
    capex_lakh = budget["capexCr"] / LAKH_CR
    goes = budget["goesTo"]
    states = goes[0]["paise"]
    interest = goes[1]["paise"]
    now = datetime.now(timezone.utc).isoformat()

    breakdown = [
        {
            "label": g["label"],
            "value": g["paise"],
            "unit": "paise/₹",
            "share": g["paise"],
            "colorKey": g.get("colorKey"),
        }
        for g in goes
    ]

    return {
        "moduleKey": "union-budget",
        "title": f"Union Budget {budget['fiscalYear']} — Where the money goes",
        "cadence": "annual",
        "plainSummary": (
            f"The government plans to spend about ₹{total_lakh:.1f} lakh crore in "
            f"{budget['fiscalYear']}. The biggest slices go to the states' share of taxes "
            f"({states} paise of every rupee) and interest on past borrowing ({interest} paise). "
            f"The fiscal deficit is targeted at {budget['fiscalDeficitPctGdp']}% of GDP."
        ),
        "asOfDate": datetime.fromisoformat(budget["presentedOn"]).replace(tzinfo=timezone.utc).isoformat(),
        "capturedAt": now,
        "metrics": [
            {"key": "total_expenditure", "label": "Total expenditure", "value": round(total_lakh, 2), "unit": "₹ lakh cr"},
            {"key": "capex", "label": "Capital expenditure", "value": round(capex_lakh, 2), "unit": "₹ lakh cr"},
            {"key": "fiscal_deficit", "label": "Fiscal deficit", "value": budget["fiscalDeficitPctGdp"], "unit": "% of GDP"},
            {"key": "interest_share", "label": "Interest payments", "value": interest, "unit": "paise/₹"},
        ],
        "breakdown": breakdown,
        "provenance": {
            "sourceName": budget["source"]["name"],
            "sourceUrl": budget["source"]["url"],
            "fetchedAt": now,
            "note": budget.get("note", ""),
        },
    }


def top_ministries(n: int = 10, budget: dict | None = None) -> list[dict]:
    budget = budget or load_dataset()
    total = budget["totalExpenditureCr"]
    out = []
    for m in budget["ministries"][:n]:
        out.append(
            {
                "name": m["name"],
                "crore": m["crore"],
                "sharePct": round(m["crore"] / total * 100, 1),
            }
        )
    return out


def run() -> dict:
    return build_snapshot()
