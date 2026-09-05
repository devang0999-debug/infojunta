"""RBI forex reserves — two-hop scrape of the Weekly Statistical Supplement.

Reported strictly in INR (₹ lakh crore) using the WSS ₹-crore column.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone

from bs4 import BeautifulSoup

from fetch import fetch_html, to_number

LISTING_URL = "https://www.rbi.org.in/scripts/WSSViewDetail.aspx?TYPE=Section&PARAM1=2"
VIEW_BASE = "https://www.rbi.org.in/scripts/WSSView.aspx?Id="
LAKH_CR = 100_000

ROWS = [
    (re.compile("Total Reserves", re.I), "Total Reserves", "total", "pop-blue"),
    (re.compile("Foreign Currency Assets", re.I), "Foreign Currency Assets", "fca", "pop-teal"),
    (re.compile("Gold", re.I), "Gold", "gold", "pop-yellow"),
    (re.compile("SDRs", re.I), "SDRs", "sdr", "pop-pink"),
    (re.compile("Reserve Position in the IMF", re.I), "Reserve Position in the IMF", "imf", "pop-purple"),
]

PLAIN = {
    "total": "India's total war-chest of foreign assets — what backs the rupee and pays for imports.",
    "fca": "Foreign currencies the RBI holds (dollars, euros, etc.) — the bulk of the reserves.",
    "gold": "Gold held as reserve; rises in value when gold prices climb.",
    "sdr": "Special Drawing Rights — an IMF reserve asset India can draw on.",
    "imf": "India's automatic drawing quota at the IMF.",
}


def resolve_latest_id(listing_html: str) -> str:
    m = re.search(r"href=WSSView\.aspx\?Id=(\d+)>\s*Foreign Exchange Reserves", listing_html, re.I)
    if not m:
        raise RuntimeError("Forex: no WSSView link found in WSS listing")
    return m.group(1)


def parse_table(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    as_of = datetime.now(timezone.utc)
    m = re.search(r"As on\s+([A-Za-z.]+\s+\d{1,2},\s+\d{4})", html)
    if m:
        as_of = datetime.strptime(m.group(1).replace(".", ""), "%b %d, %Y").replace(tzinfo=timezone.utc)

    # label -> [8 numeric columns], using DIRECT child <td> only (RBI nests tables).
    row_values: dict[str, list[float]] = {}
    for tr in soup.find_all("tr"):
        cells = [re.sub(r"\s+", " ", td.get_text()).strip() for td in tr.find_all("td", recursive=False)]
        if len(cells) < 9:
            continue
        row_values[cells[0]] = [to_number(c) for c in cells[1:9]]

    if not any(re.search("Total Reserves", k, re.I) for k in row_values):
        raise RuntimeError("Forex: reserves table rows not found")

    def find_nums(pat: re.Pattern) -> list[float]:
        for label, nums in row_values.items():
            if pat.search(label):
                return nums
        return []

    items = []
    for pat, label, key, color in ROWS:
        nums = find_nums(pat)
        items.append(
            {
                "label": label,
                "key": key,
                "color": color,
                "inrCr": nums[0] if len(nums) > 0 else float("nan"),
                "weekVarInrCr": nums[2] if len(nums) > 2 else 0.0,
            }
        )

    total = next(i for i in items if i["key"] == "total")
    if total["inrCr"] != total["inrCr"]:
        raise RuntimeError("Forex: could not read Total Reserves value")

    def lakh(cr: float) -> float:
        return round(cr / LAKH_CR, 2)

    total_lakh = total["inrCr"] / LAKH_CR
    week_lakh = total["weekVarInrCr"] / LAKH_CR
    now = datetime.now(timezone.utc).isoformat()

    metrics = []
    for i in items:
        wk = i["weekVarInrCr"]
        metrics.append(
            {
                "key": i["key"],
                "label": i["label"],
                "value": lakh(i["inrCr"]),
                "unit": "₹ lakh cr",
                "plain": PLAIN[i["key"]],
                "previous": lakh(i["inrCr"] - wk),
                "change": round(wk / LAKH_CR, 2),
                "changeLabel": f"{'+' if wk >= 0 else ''}{wk / LAKH_CR:.2f} L cr WoW",
                "direction": "up" if wk > 0 else "down" if wk < 0 else "flat",
            }
        )

    breakdown = [
        {
            "label": i["label"],
            "value": lakh(i["inrCr"]),
            "unit": "₹ lakh cr",
            "share": round(i["inrCr"] / total["inrCr"] * 100, 1),
            "colorKey": i["color"],
        }
        for i in items
        if i["key"] != "total" and i["inrCr"] == i["inrCr"]
    ]

    return {
        "moduleKey": "rbi-forex-reserves",
        "title": "India's Foreign Exchange Reserves",
        "cadence": "weekly",
        "plainSummary": (
            f"India's foreign exchange reserves stand at about ₹{total_lakh:.1f} lakh crore, "
            f"{'up' if week_lakh >= 0 else 'down'} ₹{abs(week_lakh):.2f} lakh crore over the week. "
            "Reserves cushion the rupee and pay for imports; most of it sits in foreign "
            "currencies, the rest in gold, SDRs and the IMF."
        ),
        "asOfDate": as_of.isoformat(),
        "capturedAt": now,
        "metrics": metrics,
        "breakdown": breakdown,
        "provenance": {
            "sourceName": "Reserve Bank of India — Weekly Statistical Supplement",
            "sourceUrl": LISTING_URL,
            "fetchedAt": now,
            "note": "Latest 'Foreign Exchange Reserves' table from the WSS (₹ crore column). ~1 week reporting lag.",
        },
    }


def run() -> dict:
    listing = fetch_html(LISTING_URL, timeout=40)
    forex_id = resolve_latest_id(listing)
    return parse_table(fetch_html(VIEW_BASE + forex_id))
