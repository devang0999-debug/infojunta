"""Custom fetch + parse helpers for Indian government sites.

Same philosophy as the TypeScript pipeline: our own scrapers, no third-party
aggregator, so there's no lag between a release and our breakdown.
"""
from __future__ import annotations

import re

import requests

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 kya-haal-junta/0.1 (+civic-data)"
)

HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
}


def fetch_html(url: str, timeout: int = 25) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=timeout)
    resp.raise_for_status()
    return resp.text


def to_number(raw: str | None) -> float:
    """Parse '5.25', '5.25%', '6,81,000', '₹ 50,65,345 crore' -> float (NaN if none)."""
    if raw is None:
        return float("nan")
    cleaned = re.sub(r"[^\d.\-]", "", str(raw))
    if cleaned in ("", "-", ".", "-."):
        return float("nan")
    try:
        return float(cleaned)
    except ValueError:
        return float("nan")
