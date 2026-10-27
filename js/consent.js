/* ============================================================
   Zgody na cookies (RODO / Prawo komunikacji elektronicznej)
   - Google Consent Mode v2 (domyślnie wszystko "denied")
   - Google Analytics 4 ładuje się dopiero po zgodzie "Statystyka"
   - Meta Pixel ładuje się dopiero po zgodzie "Marketing"
   Identyfikatory wpisujesz w js/config-data.js → CONFIG.tracking
   ============================================================ */
(function(){
  "use strict";
  var KEY = "pj_consent_v1";
  var VERSION = 1;                       // zwiększ, gdy zmienisz zakres zgód — baner pojawi się ponownie
  var T = (typeof CONFIG !== "undefined" && CONFIG.tracking) || {};
  var GA_ID = (T.gaMeasurementId || "").trim();
  var PIXEL_ID = (T.metaPixelId || "").trim();
  var hasTools = !!(GA_ID || PIXEL_ID);

  /* --- Consent Mode: ustawienia domyślne (zanim cokolwiek się załaduje) --- */
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", wait_for_update: 500
  });

  function read(){
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      return v && v.v === VERSION ? v : null;
    } catch(e){ return null; }
  }
  function write(analytics, marketing){
    var v = { v: VERSION, analytics: !!analytics, marketing: !!marketing, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){}
    return v;
  }

  var gaLoaded = false, pixelLoaded = false;
  function loadGA(){
    if (!GA_ID || gaLoaded) return; gaLoaded = true;
    var s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }
  function loadPixel(){
    if (!PIXEL_ID || pixelLoaded) return; pixelLoaded = true;
    (function(f,b,e,v,n,t,s){ if(f.fbq) return; n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
      if(!f._fbq) f._fbq=n; n.push=n; n.loaded=true; n.version="2.0"; n.queue=[];
      t=b.createElement(e); t.async=true; t.src="https://connect.facebook.net/en_US/fbevents.js";
      s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
    })(window, document, "script");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function apply(c){
    if (!c) return;
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    if (c.analytics) loadGA();
    if (c.marketing) loadPixel();
  }

  /* --- zdarzenia konwersji: bezpieczne, nic nie robią bez zgody --- */
  window.pjTrack = function(name, params){
    var c = read(); if (!c) return;
    params = params || {};
    if (c.analytics && GA_ID && window.gtag) gtag("event", name.ga || name, params);
    if (c.marketing && PIXEL_ID && window.fbq) window.fbq("track", name.meta || name, params);
  };

  /* --- interfejs --- */
  var banner, modal;
  function el(html){ var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  function closeAll(){
    if (banner){ banner.remove(); banner = null; }
    if (modal){ modal.remove(); modal = null; }
  }
  function save(analytics, marketing){
    var prev = read();
    var c = write(analytics, marketing);
    closeAll();
    var withdrew = prev && ((prev.analytics && !c.analytics) || (prev.marketing && !c.marketing));
    if (withdrew){ window.location.reload(); return; }   // wyłącza już załadowane skrypty
    apply(c);
  }

  function showBanner(){
    if (banner || modal) return;
    banner = el(
      '<div class="cc-banner" role="dialog" aria-labelledby="ccTitle" aria-live="polite">' +
        '<div class="cc-text"><strong id="ccTitle">Szanujemy Twoją prywatność</strong>' +
        '<p>Używamy plików cookies, aby strona działała, oraz — za Twoją zgodą — do statystyk i reklam (Google, Meta). Możesz zaakceptować wszystko, odrzucić lub wybrać. Szczegóły: <a href="polityka-prywatnosci.html#cookies">polityka prywatności</a>.</p></div>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn" data-cc="reject">Odrzucam</button>' +
          '<button type="button" class="cc-btn" data-cc="settings">Ustawienia</button>' +
          '<button type="button" class="cc-btn cc-primary" data-cc="accept">Akceptuję wszystkie</button>' +
        '</div></div>');
    document.body.appendChild(banner);
    banner.addEventListener("click", function(e){
      var a = e.target.getAttribute && e.target.getAttribute("data-cc");
      if (a === "accept") save(true, true);
      else if (a === "reject") save(false, false);
      else if (a === "settings"){ closeAll(); showModal(); }
    });
  }

  function showModal(){
    if (modal) return;
    var c = read() || { analytics: false, marketing: false };
    modal = el(
      '<div class="cc-overlay"><div class="cc-modal" role="dialog" aria-modal="true" aria-labelledby="ccMTitle">' +
        '<h2 id="ccMTitle">Ustawienia cookies</h2>' +
        '<p class="cc-intro">Wybierz, na co się zgadzasz. Zgodę możesz zmienić lub wycofać w dowolnym momencie (link „Ustawienia cookies” w stopce strony).</p>' +
        '<div class="cc-row"><div><strong>Niezbędne</strong><p>Działanie strony, bezpieczeństwo, zapamiętanie Twojego wyboru. Nie wymagają zgody.</p></div><span class="cc-always">Zawsze aktywne</span></div>' +
        '<div class="cc-row"><div><strong>Statystyka</strong><p>Google Analytics — anonimowe statystyki odwiedzin, dzięki którym poprawiamy stronę.</p></div>' +
          '<label class="cc-switch"><input type="checkbox" id="ccAnalytics"' + (c.analytics ? " checked" : "") + '><span></span><em class="sr">Statystyka</em></label></div>' +
        '<div class="cc-row"><div><strong>Marketing</strong><p>Meta Pixel (Facebook, Instagram) — mierzenie skuteczności reklam i wyświetlanie ich osobom, które odwiedziły naszą stronę.</p></div>' +
          '<label class="cc-switch"><input type="checkbox" id="ccMarketing"' + (c.marketing ? " checked" : "") + '><span></span><em class="sr">Marketing</em></label></div>' +
        '<div class="cc-actions cc-modal-actions">' +
          '<button type="button" class="cc-btn" data-cc="reject">Odrzucam wszystkie</button>' +
          '<button type="button" class="cc-btn" data-cc="save">Zapisz wybór</button>' +
          '<button type="button" class="cc-btn cc-primary" data-cc="accept">Akceptuję wszystkie</button>' +
        '</div></div></div>');
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){
      var a = e.target.getAttribute && e.target.getAttribute("data-cc");
      if (a === "accept") save(true, true);
      else if (a === "reject") save(false, false);
      else if (a === "save") save(modal.querySelector("#ccAnalytics").checked, modal.querySelector("#ccMarketing").checked);
      else if (e.target.classList && e.target.classList.contains("cc-overlay")){ closeAll(); if (!read() && hasTools) showBanner(); }
    });
    document.addEventListener("keydown", function esc(e){
      if (e.key === "Escape" && modal){ closeAll(); if (!read() && hasTools) showBanner(); document.removeEventListener("keydown", esc); }
    });
    var first = modal.querySelector("button"); if (first) first.focus();
  }

  window.PJConsent = { open: showModal, get: read };

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("[data-cookie-settings]").forEach(function(b){
      b.addEventListener("click", function(){ closeAll(); showModal(); });
    });
    var c = read();
    if (c) apply(c);
    else if (hasTools || /[?&]cookie-banner=1/.test(location.search)) showBanner();
  });
})();
