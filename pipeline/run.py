"""Run the Python data pipeline and write snapshots the Next app reads.

Usage:
    python pipeline/run.py                # refresh all modules
    python pipeline/run.py rbi-policy-rates
    python pipeline/run.py rbi-forex-reserves

Writes to src/data/snapshots/<module>.json (same shape as the TypeScript
pipeline). A GitHub Action can run this on a schedule and commit the changes,
keeping production data fresh even without a database.
"""
from __future__ import annotations

import json
import pathlib
import sys

import rbi_forex
import rbi_rates

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "data" / "snapshots"

MODULES = {
    "rbi-policy-rates": rbi_rates.run,
    "rbi-forex-reserves": rbi_forex.run,
}


def write_snapshot(key: str, snapshot: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{key}.json"
    with path.open("w", encoding="utf-8") as fh:
        json.dump(snapshot, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"  wrote {path.relative_to(ROOT)}")


def main() -> int:
    requested = sys.argv[1:] or list(MODULES)
    failures = 0
    for key in requested:
        run = MODULES.get(key)
        if run is None:
            print(f"! unknown module: {key} (have: {', '.join(MODULES)})")
            failures += 1
            continue
        try:
            print(f"→ {key}")
            snap = run()
            head = snap["metrics"][0]
            print(f"  ok · as of {snap['asOfDate']} · {head['label']} = {head['value']}{head.get('unit', '')}")
            write_snapshot(key, snap)
        except Exception as exc:  # noqa: BLE001 - report and continue
            print(f"  FAILED: {exc}")
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
