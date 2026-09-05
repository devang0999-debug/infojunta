"""RBI policy rates — scrape the 'Current Rates' box (#wrapper) on rbi.org.in."""
from __future__ import annotations

import re
from datetime import datetime, timezone

from bs4 import BeautifulSoup

from fetch import fetch_html, to_number

SOURCE_URL = "https://www.rbi.org.in/"

PLAIN = {
    "Policy Repo Rate": "The rate at which the RBI lends to banks. Up = loans and EMIs get costlier.",
    "Standing Deposit Facility Rate": "The floor rate at which banks park spare cash with the RBI (no collateral).",
    "Marginal Standing Facility Rate": "The emergency rate banks pay to borrow overnight from the RBI.",
    "Bank Rate": "The rate the RBI charges on longer-term lending to banks; a policy signal.",
    "Fixed Reverse Repo Rate": "The rate the RBI pays banks to park money with it, absorbing liquidity.",
    "CRR": "Share of deposits banks must keep as cash with the RBI, earning nothing.",
    "SLR": "Share of deposits banks must hold in safe assets like government bonds.",
    "INR / 1 USD": "How many rupees one US dollar buys right now (FBIL reference).",
}

WANT = [
    ("Policy Repo Rate", "repo", "%"),
    ("Fixed Reverse Repo Rate", "reverse_repo", "%"),
    ("Standing Deposit Facility Rate", "sdf", "%"),
    ("Marginal Standing Facility Rate", "msf", "%"),
    ("Bank Rate", "bank_rate", "%"),
    ("CRR", "crr", "%"),
    ("SLR", "slr", "%"),
    ("INR / 1 USD", "inr_usd", "₹"),
]


def parse(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    box = soup.find(id="wrapper")
    if box is None:
        raise RuntimeError("RBI: #wrapper rates box not found")

    values: dict[str, str] = {}
    for tr in box.find_all("tr"):
        th = tr.find("th")
        td = tr.find("td")
        if not th or not td:
            continue
        name = re.sub(r"\s+", " ", th.get_text()).strip()
        val = re.sub(r"\s+", " ", td.get_text()).strip().lstrip(":").strip()
        if name and val:
            values[name] = val

    if "Policy Repo Rate" not in values:
        raise RuntimeError("RBI: 'Policy Repo Rate' row missing — layout changed")

    as_of = datetime.now(timezone.utc)
    sub = box.find(class_="subText", string=re.compile("As at", re.I))
    if sub:
        m = re.search(r"of\s+([A-Za-z]+ \d{1,2}, \d{4})", sub.get_text())
        if m:
            as_of = datetime.strptime(m.group(1), "%B %d, %Y").replace(tzinfo=timezone.utc)

    metrics = []
    for name, key, unit in WANT:
        if name not in values:
            continue
        num = to_number(values[name])
        metrics.append(
            {
                "key": key,
                "label": name,
                "value": values[name] if num != num else num,
                "unit": unit,
                "plain": PLAIN.get(name),
            }
        )

    repo = next((m["value"] for m in metrics if m["key"] == "repo"), "—")
    crr = next((m["value"] for m in metrics if m["key"] == "crr"), "—")
    now = datetime.now(timezone.utc).isoformat()

    return {
        "moduleKey": "rbi-policy-rates",
        "title": "RBI Policy Rates",
        "cadence": "realtime",
        "plainSummary": (
            f"The RBI's repo rate stands at {repo}%, with CRR at {crr}%. "
            "These set the cost of money across the economy — your loan EMIs, deposit "
            "returns and how much cash banks must keep aside all move with them."
        ),
        "asOfDate": as_of.isoformat(),
        "capturedAt": now,
        "metrics": metrics,
        "provenance": {
            "sourceName": "Reserve Bank of India (Current Rates)",
            "sourceUrl": SOURCE_URL,
            "fetchedAt": now,
            "note": "Scraped from the RBI homepage rates box; FX reference from FBIL.",
        },
    }


def run() -> dict:
    return parse(fetch_html(SOURCE_URL))
