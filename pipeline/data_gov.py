"""data.gov.in fetcher — the Open Government Data (OGD) platform.

data.gov.in exposes many datasets as JSON/CSV resources behind a free API key.
Unlike the RBI scrapers this is a clean API, so it's the tidiest way to add
more official series later (prices, schemes, census). Set a key to use it:

    export DATA_GOV_API_KEY=xxxxxxxx
    python data_gov.py <resource_id>

No key committed; without one this module is inert (returns an empty result),
so the rest of the pipeline still runs.
"""
from __future__ import annotations

import os
import sys

import requests

BASE = "https://api.data.gov.in/resource"
# data.gov.in publishes a public sample key; users should set their own.
API_KEY = os.environ.get("DATA_GOV_API_KEY", "")


def is_configured() -> bool:
    return bool(API_KEY)


def fetch_resource(resource_id: str, limit: int = 100, offset: int = 0) -> dict:
    """Fetch one OGD resource as JSON. Raises if no API key is set."""
    if not API_KEY:
        raise RuntimeError(
            "data.gov.in API key not set. `export DATA_GOV_API_KEY=...` first "
            "(get a free key at https://data.gov.in)."
        )
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }
    resp = requests.get(f"{BASE}/{resource_id}", params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def records(resource_id: str, limit: int = 100) -> list[dict]:
    """Convenience: return just the records list from a resource."""
    payload = fetch_resource(resource_id, limit=limit)
    return payload.get("records", [])


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: python data_gov.py <resource_id>")
        return 2
    if not is_configured():
        print("DATA_GOV_API_KEY not set — nothing to do.")
        return 0
    rows = records(sys.argv[1], limit=int(sys.argv[2]) if len(sys.argv) > 2 else 20)
    print(f"fetched {len(rows)} records")
    for r in rows[:5]:
        print(" ", r)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
