/*
 * Plain Words for Enterprise AI SWE: svephjälp för portalens ramar.
 *
 * Bara för utvecklarversionen. tools/bygg-zip.sh tar bort filen ur zip-filen
 * och ur manifestet, så den når aldrig Chrome Web Store.
 *
 * Många sidor i portalen ritas i en ram (iframe) från
 * sandbox-N.reactblade.portal.azure.net. Svepet i tests/sweep-in-browser.js
 * körs i själva sidan och kommer inte in i ramen. Den här filen körs inuti
 * ramen och väntar på ett meddelande från portalen:
 *   { pwFrame: "inventory" }  listar knapparna i ramen med sina ankare
 *   { pwFrame: "sweep" }      håller "musen" över varje knapp, som svepet
 * Svaret skickas tillbaka till portalen, aldrig någon annanstans. Den klickar
 * aldrig på något. Se tests/sweep-frames.js för hur den startas.
 */
(function () {
  "use strict";
  if (window === window.top || window.__pwFrameLoaded) return;
  window.__pwFrameLoaded = true;

  var PARENT = "https://portal.azure.com";
  var SEL = 'a[href], button, summary, input, textarea, select, [role="tab"], [role="button"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [role="switch"], [role="checkbox"], [role="radio"], h2, h3';
  var SKIP = '.sr-only, [hidden], [aria-hidden="true"], template, #pw-host, pre, code';

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }
  function clean(s, n) {
    return (s || "").replace(/\s+/g, " ").trim().slice(0, n);
  }

  function anchors(el) {
    var cls = (typeof el.className === "string" ? el.className : "")
      .split(/\s+/)
      .filter(function (c) {
        return /^(fxs|fxc|msportalfx|azc|ms-)/.test(c);
      })
      .slice(0, 3)
      .join(".");
    var tidEl = el.closest("[data-testid]");
    var auto = el.closest("[data-automation-id], [data-automationid]");
    return [
      cls,
      tidEl ? "tid=" + tidEl.getAttribute("data-testid").slice(0, 50) : "",
      auto ? "auto=" + (auto.getAttribute("data-automation-id") || auto.getAttribute("data-automationid")).slice(0, 50) : "",
      el.getAttribute("role") ? "role=" + el.getAttribute("role") : "",
      el.getAttribute("name") ? "name=" + el.getAttribute("name").slice(0, 40) : ""
    ]
      .filter(Boolean)
      .join(" ");
  }

  function skippedBy(el) {
    var list = globalThis.PW_SKIPPED || [];
    // Samma tålighet som tillägget: normal Unicode-form och inga ikontecken.
    var tidy = function (v) {
      return clean(String(v || "").normalize("NFC").replace(/[\uE000-\uF8FF]/g, " "), 200).toLowerCase();
    };
    var text = tidy(el.innerText);
    var label = tidy(el.getAttribute("aria-label"));
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      var sels = (e.selectors || []).concat(
        (e.aria || []).filter(function (a) {
          return typeof a === "string";
        }).map(function (a) {
          return '[aria-label="' + a + '" i]';
        })
      );
      for (var j = 0; j < sels.length; j++) {
        try {
          if (el.closest(sels[j])) return true;
        } catch (err) {
          /* ogiltig väljare */
        }
      }
      if ((e.texts || []).indexOf(text) !== -1) return true;
      if (label && (e.aria || []).indexOf(label) !== -1) return true;
    }
    return false;
  }

  function items() {
    var out = [];
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el.closest(SKIP)) return;
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      var parent = el.parentElement && el.parentElement.closest(SEL);
      if (parent && !parent.closest(SKIP)) return;
      out.push(el);
    });
    return out;
  }

  function describe(el) {
    return [
      el.tagName.toLowerCase(),
      clean(el.getAttribute("aria-label") || el.getAttribute("title"), 60),
      el.matches("input, textarea, select") ? clean(el.getAttribute("placeholder"), 50) : clean(el.innerText, 50),
      anchors(el)
    ].join(" | ");
  }

  async function sweep() {
    var list = items();
    var report = { frame: location.hostname, version: (globalThis.PW_EXPLANATIONS || []).length, total: list.length, withExplanation: 0, skippedOnPurpose: 0, withUse: 0, found: {}, missing: [] };
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      document.body.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      await sleep(20);
      if (!el.isConnected) continue;
      el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      await sleep(560);
      var host = document.getElementById("pw-host");
      var shadow = host && host.shadowRoot;
      var bubble = shadow && shadow.querySelector(".bubble");
      var key = bubble && bubble.classList.contains("show") ? bubble.getAttribute("data-key") : null;
      if (key) {
        report.withExplanation++;
        report.found[key] = (report.found[key] || 0) + 1;
        var use = shadow.querySelector(".use");
        if (use && !use.hidden && use.textContent.length > 8) report.withUse++;
      } else if (skippedBy(el)) {
        report.skippedOnPurpose++;
      } else {
        report.missing.push(describe(el).replace(/\d+/g, "N"));
      }
    }
    document.body.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    report.missing = Array.from(new Set(report.missing)).slice(0, 150);
    return report;
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== PARENT || !event.data || !event.data.pwFrame) return;
    var reply = function (data) {
      event.source.postMessage({ pwFrameReply: event.data.pwFrame, data: data }, PARENT);
    };
    if (event.data.pwFrame === "inventory") {
      reply({ frame: location.hostname, items: Array.from(new Set(items().map(describe))).slice(0, 200) });
    } else if (event.data.pwFrame === "inventory-deep") {
      // Samma lista, plus föräldrarna med testid, roll, namn eller klassnamn, och ramens adress utan id.
      reply({
        frame: location.hostname,
        path: (location.pathname + location.hash).replace(/[0-9a-f]{8}-[0-9a-f-]{27}/gi, "<id>").slice(0, 160),
        title: document.title.slice(0, 80),
        html: Array.from(document.documentElement.attributes).map(function (a) {
          return a.name + "=" + a.value.slice(0, 60);
        }).join(" "),
        body: (document.body.className || "").slice(0, 120),
        items: Array.from(
          new Set(
            items().map(function (el) {
              var chain = [];
              for (var p = el.parentElement, i = 0; p && p !== document.body && i < 8; p = p.parentElement, i++) {
                var bits = [
                  p.getAttribute("data-testid") ? "tid=" + p.getAttribute("data-testid").slice(0, 40) : "",
                  p.getAttribute("role") ? "role=" + p.getAttribute("role") : "",
                  p.getAttribute("aria-label") ? "al=" + clean(p.getAttribute("aria-label"), 30) : "",
                  p.id && !/\d{3,}|^[a-z]+-\d|^id__/i.test(p.id) ? "#" + p.id.slice(0, 30) : "",
                  (typeof p.className === "string" ? p.className : "").split(/\s+/).filter(function (c) {
                    return /^(fxs|fxc|azc|ms-|msportalfx)/.test(c);
                  }).slice(0, 2).join(".")
                ].filter(Boolean);
                if (bits.length) chain.push(bits.join(" "));
              }
              return describe(el) + " << " + chain.slice(0, 4).join(" < ");
            })
          )
        ).slice(0, 120)
      });
    } else if (event.data.pwFrame === "sweep") {
      sweep().then(reply);
    }
  });
})();
