"""Unit tests for the Python data pipeline.

Run:  cd pipeline && pip install -r requirements.txt pytest && pytest
"""
import math

import budget as budget_mod
import rbi_forex
import rbi_rates
from fetch import direction, to_number


# ---- number parsing -------------------------------------------------------

def test_to_number_variants():
    assert to_number("5.25") == 5.25
    assert to_number("5.25%") == 5.25
    assert to_number("₹ 50,65,345 crore") == 5065345
    assert to_number("6,81,210") == 681210
    assert math.isnan(to_number(None))
    assert math.isnan(to_number("—"))


def test_direction():
    assert direction(6, 5) == "up"
    assert direction(4, 5) == "down"
    assert direction(5, 5) == "flat"
    assert direction(5, float("nan")) == "flat"


# ---- RBI rates parser -----------------------------------------------------

RATES_HTML = """
<html><body>
<div id="wrapper">
  <table>
    <tr><th>Policy Repo Rate</th><td> : 5.25% </td></tr>
    <tr><th>CRR</th><td> : 3.00% </td></tr>
    <tr><th>SLR</th><td> : 18.00% </td></tr>
    <tr><th>INR / 1 USD</th><td> : 94.9701 </td></tr>
  </table>
  <span class="subText"> (As at 1.00pm of September 02, 2026) </span>
</div>
</body></html>
"""


def test_parse_rbi_rates():
    snap = rbi_rates.parse(RATES_HTML)
    metrics = {m["key"]: m["value"] for m in snap["metrics"]}
    assert metrics["repo"] == 5.25
    assert metrics["crr"] == 3.0
    assert metrics["slr"] == 18.0
    assert snap["moduleKey"] == "rbi-policy-rates"
    assert snap["asOfDate"].startswith("2026-09-02")


# ---- Forex parser (nested layout tables, ₹ crore columns) -----------------

FOREX_HTML = """
<html><body>
<p>Foreign Exchange Reserves — As on Aug. 21, 2026</p>
<table><tr><td>
  <table>
    <tr><td>1 Total Reserves</td>
      <td>6981330</td><td>729328</td><td>139552</td><td>12422</td>
      <td>427469</td><td>38221</td><td>935135</td><td>38608</td></tr>
    <tr><td>1.1 Foreign Currency Assets #</td>
      <td>5660390</td><td>591333</td><td>107510</td><td>9482</td>
      <td>423023</td><td>39050</td><td>563643</td><td>9082</td></tr>
    <tr><td>1.2 Gold</td>
      <td>1093327</td><td>114218</td><td>30022</td><td>2801</td>
      <td>-983</td><td>-1177</td><td>349253</td><td>29216</td></tr>
  </table>
</td></tr></table>
</body></html>
"""


def test_resolve_latest_forex_id():
    listing = 'x <a href=WSSView.aspx?Id=28669>Foreign Exchange Reserves</a> more'
    assert rbi_forex.resolve_latest_id(listing) == "28669"


def test_parse_forex_inr():
    snap = rbi_forex.parse_table(FOREX_HTML)
    metrics = {m["key"]: m for m in snap["metrics"]}
    # 6981330 crore -> 69.81 lakh crore
    assert metrics["total"]["value"] == 69.81
    assert metrics["total"]["unit"] == "₹ lakh cr"
    assert metrics["total"]["direction"] == "up"
    assert metrics["fca"]["value"] == 56.6
    # composition excludes the total row
    assert all(b["label"] != "Total Reserves" for b in snap["breakdown"])
    assert snap["asOfDate"].startswith("2026-08-2")


# ---- Budget builder -------------------------------------------------------

def test_build_budget_snapshot():
    snap = budget_mod.build_snapshot()
    metrics = {m["key"]: m["value"] for m in snap["metrics"]}
    # FY2026-27 total ₹53.47 lakh crore
    assert metrics["total_expenditure"] > 50
    assert snap["moduleKey"] == "union-budget"
    assert len(snap["breakdown"]) == 9
    ministries = budget_mod.top_ministries(3)
    assert ministries[0]["name"] == "Finance"
    assert ministries[1]["name"] == "Defence"
