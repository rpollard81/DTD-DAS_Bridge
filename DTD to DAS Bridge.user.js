// ==UserScript==
// @name         DTD to DAS Bridge
// @match        https://chatroom.warriortrading.com/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// ==/UserScript==

alert('DTD to DAS Bridge');
console.log('DTD to DAS Bridge');

(() => {
  "use strict";

  // IP address should be 127.0.0.1 if DAS runs on the same machine as the browser that DTD runs in
  const DAS_HOST_IP_ADDRESS = "127.0.0.1";
  const DAS_HOST_PORT = "8787";
  const RECEIVER_URL = "http://" + DAS_HOST_IP_ADDRESS + ":" + DAS_HOST_PORT + "/symbol";
  const SYMBOL_RE = /^[A-Z0-9][A-Z0-9._-]{0,15}$/;
  const DEBOUNCE_MS = 40;

  let installedOnDoc = new WeakSet();

  function sendSymbol(symbol) {
      GM_xmlhttpRequest({
          method: "POST",
          url: RECEIVER_URL,
          headers: { "Content-Type": "application/json" },
          data: JSON.stringify({ symbol }),
          onload: (r) => console.log("[DTD->DAS] POST ok", r.status, r.responseText),
          onerror: (e) => console.error("[DTD->DAS] POST failed", e),
          timeout: 2000,
          ontimeout: () => console.error("[DTD->DAS] POST timeout"),
      });
  }


  function installInDocument(doc) {
    if (!doc || installedOnDoc.has(doc)) return;
    installedOnDoc.add(doc);

    let lastSent = null;
    let t = null;

    function findQuoteLink() {
      return doc.querySelector('a.HeaderTop-link[href*="/quote/"]');
    }

    function extractSymbol(a) {
      if (!a) return null;

      const text = (a.textContent || "").trim().toUpperCase();
      if (SYMBOL_RE.test(text)) return text;

      const href = a.getAttribute("href") || "";
      const m = href.match(/\/quote\/([^/?#]+)/i);
      if (m) {
        const sym = decodeURIComponent(m[1]).trim().toUpperCase();
        if (SYMBOL_RE.test(sym)) return sym;
      }
      return null;
    }

    function checkNow() {
      const a = findQuoteLink();
      const sym = extractSymbol(a);
      if (sym && sym !== lastSent) {
        lastSent = sym;
        console.log("[DTD->DAS] symbol:", sym);
        sendSymbol(sym);
      }
    }

    function schedule() {
      clearTimeout(t);
      t = setTimeout(checkNow, DEBOUNCE_MS);
    }

    const obs = new MutationObserver(schedule);
    obs.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["href", "class"],
    });

    checkNow();
  }

  function tryInstall() {
    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (doc && doc.documentElement) {
        installInDocument(doc);
      }
    } catch (e) {
      // If this throws, the iframe is not same-origin (but your blob origin suggests it should be)
      console.warn("[DTD->DAS] cannot access iframe document:", e);
    }
  }

  // Always install on the top document too
  installInDocument(document);

  // Poll briefly because blob iframes often appear after initial load
  const poll = setInterval(tryInstall, 250);
  setTimeout(() => clearInterval(poll), 15000);

  // Also run immediately
  tryInstall();
})();