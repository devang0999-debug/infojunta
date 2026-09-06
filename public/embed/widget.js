/*!
 * kya haal junta? — embeddable live-data widget.
 *
 * Drop a placeholder and this script on any page to show live Indian
 * government data (RBI repo rate, forex reserves, or where the Union Budget
 * rupee goes):
 *
 *   <div data-khj="repo"></div>
 *   <script src="https://infojunta.vercel.app/embed/widget.js" async></script>
 *
 * Supported types: "repo" | "rates" | "forex" | "budget".
 * No dependencies. Vanilla JS. Fetches /embed/data.json from this script's own
 * origin, so it works cross-site.
 */
(function () {
  "use strict";

  var scriptEl =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  // Base URL = folder this script was served from.
  var BASE = scriptEl && scriptEl.src ? scriptEl.src.replace(/widget\.js.*$/, "") : "/embed/";
  var SITE = "https://infojunta.vercel.app";

  var dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(BASE + "data.json", { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
    return dataPromise;
  }

  function ensureStyles() {
    if (document.querySelector('link[data-khj-css]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = BASE + "widget.css";
    link.setAttribute("data-khj-css", "1");
    document.head.appendChild(link);
  }

  var COLORS = ["#3f7de0", "#e8559b", "#1cb3aa", "#8a76ec", "#2ba24f", "#f3c74b", "#6a6357"];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function foot(source, asOf) {
    return (
      '<div class="khj-foot"><span>' +
      esc(source || "") +
      (asOf ? " · " + esc(asOf) : "") +
      '</span><a href="' +
      SITE +
      '" target="_blank" rel="noopener">kya haal junta?</a></div>'
    );
  }

  function renderRepo(d) {
    var r = d.rates;
    return (
      '<div class="khj-kicker">RBI Repo Rate</div>' +
      '<div class="khj-value">' + r.repo + '<small>' + r.unit + "</small></div>" +
      '<div class="khj-sub">CRR ' + r.crr + "% · SLR " + r.slr + "%</div>" +
      foot(r.source, r.asOf)
    );
  }

  function renderRates(d) {
    return renderRepo(d);
  }

  function renderForex(d) {
    var f = d.forex;
    return (
      '<div class="khj-kicker">India&rsquo;s Forex Reserves</div>' +
      '<div class="khj-value">₹' + f.total + '<small> ' + f.unit.replace("₹ ", "") + "</small>" +
      '<span class="khj-chg ' + (f.direction || "up") + '">▲ ' + esc(f.changeLabel) + "</span></div>" +
      '<div class="khj-sub">What backs the rupee &amp; pays for imports</div>' +
      foot(f.source, f.asOf)
    );
  }

  function renderBudget(d) {
    var b = d.budget;
    var top = b.goesTo.slice(0, 5);
    var max = top[0].paise;
    var rows = top
      .map(function (g, i) {
        return (
          '<li><div class="khj-top"><span>' +
          esc(g.label) +
          "</span><b>" +
          g.paise +
          "p</b></div>" +
          '<div class="khj-track"><div class="khj-fill" style="width:' +
          Math.round((g.paise / max) * 100) +
          "%;background:" +
          COLORS[i % COLORS.length] +
          '"></div></div></li>'
        );
      })
      .join("");
    return (
      '<div class="khj-kicker">Union Budget ' + esc(b.fiscalYear) + " · where ₹1 goes</div>" +
      '<div class="khj-value" style="font-size:28px">₹' + b.totalLakhCr + '<small> lakh cr</small></div>' +
      '<ul class="khj-rows">' + rows + "</ul>" +
      foot(b.source)
    );
  }

  var RENDERERS = {
    repo: renderRepo,
    rates: renderRates,
    forex: renderForex,
    reserves: renderForex,
    budget: renderBudget,
    rupee: renderBudget,
  };

  function mount(el) {
    var type = (el.getAttribute("data-khj") || "repo").toLowerCase();
    var render = RENDERERS[type] || renderRepo;
    el.className = (el.className + " khj-widget khj-loading").trim();
    el.textContent = "Loading live data…";
    loadData().then(
      function (data) {
        el.classList.remove("khj-loading");
        el.innerHTML = render(data);
      },
      function () {
        el.classList.remove("khj-loading");
        el.innerHTML =
          '<div class="khj-sub">Couldn&rsquo;t load live data. <a href="' +
          SITE +
          '">Open kya haal junta?</a></div>';
      }
    );
  }

  function init() {
    ensureStyles();
    var nodes = document.querySelectorAll("[data-khj]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  // Public API for manual mounting.
  window.KyaHaalJunta = {
    render: function (el, type) {
      if (typeof el === "string") el = document.querySelector(el);
      if (el) {
        el.setAttribute("data-khj", type || "repo");
        ensureStyles();
        mount(el);
      }
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
