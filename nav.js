/**
 * CustomQuiz — delt masthead/meny (felles struktur på alle sider).
 * --------------------------------------------------------------
 * Bruk på hver side (UNNTATT forsiden, som har egen animert masthead):
 *   <div id="cq-masthead"></div>            ← der menyen skal stå
 *   …nederst, før auth.js:
 *   <script src="nav.js"></script>
 *   <script src="auth.js"></script>          ← injiserer «Min side / Logg inn» i .masthead-meta
 *
 * Aktiv side utledes av filnavnet. CSS scopes under #cq-masthead så den
 * vinner over evt. gammel masthead-CSS på siden. Bruker CSS-variabler med
 * fallback, så den ser lik ut uansett hvilke variabler siden definerer.
 */
(function () {
  var host = document.getElementById("cq-masthead");
  if (!host) return;

  // Normaliser bort .html: fra 6.8.26 er /vm.html, /dagens.html og /lag-quiz.html
  // 301-er til rene URL-er, så pathname er «lag-quiz», ikke «lag-quiz.html».
  // Uten strippingen ble ingen menylenke markert aktiv på de rene URL-ene.
  var path = (location.pathname.split("/").pop() || "index.html").toLowerCase().replace(/\.html$/, "");
  function active(file) { return path === file.replace(/\.html$/, "") ? " is-active" : ""; }

  host.className = "masthead";
  host.innerHTML =
    '<a class="masthead-logo" href="index.html" aria-label="CustomQuiz hjem">' +
      '<img class="masthead-mark" src="IMG/logo-variant.jpg" alt="">' +
      '<span class="masthead-wordmark">CustomQuiz</span>' +
    "</a>" +
    '<nav class="masthead-meta">' +
      '<a href="arkiv.html" class="masthead-link' + active("arkiv.html") + '">Arkivet</a>' +
      '<span class="masthead-sep">·</span>' +
      '<a href="vm.html" class="masthead-link masthead-link-vm' + active("vm.html") + '">VM 2026</a>' +
      '<span class="masthead-sep">·</span>' +
      '<a href="dagens.html" class="masthead-link' + active("dagens.html") + '">Dagens quiz</a>' +
      '<span class="masthead-sep">·</span>' +
      '<a href="/lag-quiz" class="masthead-link' + active("lag-quiz.html") + '">Generator</a>' +
    "</nav>";

  if (document.getElementById("cq-nav-style")) return;
  var css =
    "#cq-masthead.masthead{border-top:1px solid var(--rule-strong,#C9BD9F);border-bottom:1px solid var(--rule-strong,#C9BD9F);padding:20px 0;margin-bottom:48px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;}" +
    "#cq-masthead .masthead-logo{display:inline-flex;align-items:center;gap:4px;text-decoration:none;transition:opacity .2s ease;}" +
    "#cq-masthead .masthead-logo:hover{opacity:.82;}" +
    // Base: masthead står statisk/synlig (gjelder intern nav + tilbake/fram).
    "#cq-masthead .masthead-mark{height:48px;width:48px;object-fit:contain;display:block;border-radius:0;}" +
    "#cq-masthead .masthead-wordmark{font-family:var(--font-display,Georgia,serif);font-style:italic;font-weight:500;font-size:20px;line-height:1;letter-spacing:-.01em;color:var(--ink,#1F1A14);font-variation-settings:'opsz' 40;}" +
    "#cq-masthead .masthead-meta{display:flex;align-items:center;gap:14px;font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute,#7A6F5A);flex-wrap:wrap;}" +
    // Fersk inngang (html.cq-fresh): logo males inn, så ordmerke + meny fader inn.
    "html.cq-fresh #cq-masthead .masthead-mark{-webkit-mask-image:linear-gradient(108deg,#000 0 40%,rgba(0,0,0,0) 50%);mask-image:linear-gradient(108deg,#000 0 40%,rgba(0,0,0,0) 50%);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-size:300% 100%;mask-size:300% 100%;-webkit-mask-position:100% 0;mask-position:100% 0;animation:cqGenBrush .7s cubic-bezier(.42,0,.2,1) 0s forwards;}" +
    "@keyframes cqGenBrush{from{-webkit-mask-position:100% 0;mask-position:100% 0;}to{-webkit-mask-position:0% 0;mask-position:0% 0;}}" +
    "html.cq-fresh #cq-masthead .masthead-wordmark{opacity:0;transform:translateX(-8px);animation:cqIntroFade .3s ease .08s forwards;}" +
    "html.cq-fresh #cq-masthead .masthead-meta{opacity:0;transform:translateY(-4px);animation:cqIntroFade .32s ease .16s forwards;}" +
    "@keyframes cqIntroFade{to{opacity:1;transform:none;}}" +
    "#cq-masthead .masthead-link{color:var(--ink,#1F1A14);text-decoration:none;transition:color .2s ease;border-bottom:1px solid transparent;padding-bottom:1px;}" +
    "#cq-masthead .masthead-link:hover{color:var(--accent,#0A6E5A);border-bottom-color:var(--accent,#0A6E5A);}" +
    "#cq-masthead .masthead-link.is-active{color:var(--accent,#0A6E5A);border-bottom-color:var(--accent,#0A6E5A);}" +
    "#cq-masthead .masthead-link-vm{color:var(--spot-saffron,#C68A2E);}" +
    "#cq-masthead .masthead-link-vm:hover{color:var(--spot-saffron,#C68A2E);border-bottom-color:var(--spot-saffron,#C68A2E);}" +
    "#cq-masthead .masthead-link-vm.is-active{color:var(--spot-saffron,#C68A2E);border-bottom-color:var(--spot-saffron,#C68A2E);}" +
    "#cq-masthead .masthead-sep{color:var(--rule-strong,#C9BD9F);}" +
    "#cq-masthead .cq-auth-link{color:var(--accent,#0A6E5A);}" +
    "@media(max-width:560px){#cq-masthead.masthead{gap:12px;}#cq-masthead .masthead-mark{height:40px;width:40px;}#cq-masthead .masthead-meta{font-size:10px;gap:10px;}}" +
    "@media(prefers-reduced-motion:reduce){#cq-masthead .masthead-mark{-webkit-mask-image:none;mask-image:none;animation:none;}#cq-masthead .masthead-wordmark,#cq-masthead .masthead-meta{opacity:1;transform:none;animation:none;}}";
  var s = document.createElement("style");
  s.id = "cq-nav-style";
  s.textContent = css;
  document.head.appendChild(s);
})();

/* ── Trafikk-beacon (personvernvennlig) ──────────────────────────────────
 * Teller sidevisning aggregert per dag+sti — ingen cookies, ingen IP,
 * ingen fingerprinting (se db/migration-page-views.sql + track.js).
 * newVisit: «første visning i dag» via sessionStorage-flagg (per fane/økt)
 * — grov unike-besøk-approksimasjon uten noe person-identifiserende.
 * Egen IIFE: kjører også på sider uten #cq-masthead, og helt uavhengig av
 * mastheaden over. Alt i try/catch + fire-and-forget — kan aldri blokkere
 * sidelasting eller kaste synlige feil. Respekterer Do Not Track / GPC. */
(function () {
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return;
    if (location.protocol !== "https:" && location.protocol !== "http:") return; // file:// o.l.
    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return; // ikke tell lokal utvikling

    var path = String(location.pathname || "/").slice(0, 200);

    var newVisit = false;
    try {
      var today = new Date().toISOString().slice(0, 10);
      if (sessionStorage.getItem("cq_pv_day") !== today) {
        sessionStorage.setItem("cq_pv_day", today);
        newVisit = true;
      }
    } catch (_) { /* sessionStorage blokkert → telles kun som visning */ }

    /* Kilde-bøtte (25.8.26) — hvorfor: GSC forteller hvor mange som KLIKKER
     * fra Google, men ingenting om hva som skjer etterpå, og page_views har
     * bare (dag, sti). Vi visste derfor ikke hvor trafikken kom fra i det hele
     * tatt: organisk, direkte, delt lenke i Messenger, eller AI-svar.
     * Løsningen bruker den tellerkanalen som ALT finnes — en ekstra virtuell
     * sti «/_kilde/<boette>» gjennom samme beacon. Ingen DB-migrasjon, ingen
     * ny tjeneste, ingen cookie: vi lagrer BARE bøttenavnet, aldri full
     * referrer, aldri query, aldri noe person-identifiserende. Sendes kun ved
     * første visning per økt, så tallet = «nye besøk per kilde per dag».
     * Interne treff droppes (ellers teller vi hver klikk internt som en kilde). */
    var kilde = "";
    try {
      var r = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
      if (!r) {
        kilde = "direkte";
      } else if (r === host || r.indexOf("customquiz.no") !== -1) {
        kilde = ""; // intern navigasjon — ikke en kilde
      } else if (/(^|\.)google\./.test(r)) {
        kilde = "google";
      } else if (/(^|\.)(bing|duckduckgo|ecosia|yahoo|kvasir)\./.test(r)) {
        kilde = "annet-sok";
      } else if (/(^|\.)(facebook|fb|messenger|instagram)\./.test(r)) {
        kilde = "facebook";
      } else if (/(^|\.)(snapchat|tiktok|x|twitter|t|reddit|linkedin)\./.test(r)) {
        kilde = "sosialt";
      } else if (/(chatgpt|openai|perplexity|claude|gemini|copilot)\./.test(r)) {
        kilde = "ai";
      } else {
        kilde = "annet";
      }
    } catch (_) { kilde = "annet"; }

    var url = "/.netlify/functions/track";
    var payload = JSON.stringify({ path: path, newVisit: newVisit });
    var sent = false;
    if (navigator.sendBeacon) {
      try { sent = navigator.sendBeacon(url, payload); } catch (_) { sent = false; }
    }
    if (!sent && window.fetch) {
      fetch(url, { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "text/plain" } })
        .catch(function () { /* stille */ });
    }

    // Kilde-treffet: bare ved nytt besøk, og bare når kilden er ekstern.
    if (newVisit && kilde) {
      var kp = JSON.stringify({ path: "/_kilde/" + kilde, newVisit: true });
      var ks = false;
      if (navigator.sendBeacon) {
        try { ks = navigator.sendBeacon(url, kp); } catch (_) { ks = false; }
      }
      if (!ks && window.fetch) {
        fetch(url, { method: "POST", body: kp, keepalive: true, headers: { "Content-Type": "text/plain" } })
          .catch(function () { /* stille */ });
      }
    }
  } catch (_) { /* aldri synlig feil */ }
})();

/* ── Cloudflare Web Analytics ────────────────────────────────────────────
 * Gratis, cookiefritt ambient-lag ved SIDEN av vår egen teller over. De to
 * svarer på ulike spørsmål: Cloudflare gir referrere, land, enheter og Core
 * Web Vitals-feltdata (som GSC mangler — «not enough usage data»), mens
 * page_views i Supabase er det PERMANENTE arkivet med ubegrenset historikk.
 * Valgt 25.8.26 framfor GA4 (krever samtykkebanner i Norge og bryter
 * personvernløftet på forsiden), Plausible ($9/mnd) og Umami (6 mnd historikk).
 *
 * Cloudflare setter ingen cookies, ingen localStorage og ingen identifikator
 * på enheten. Vi respekterer likevel Do Not Track / GPC og hopper over
 * localhost, av samme grunn som beaconen over: konsistens med det siden lover.
 *
 * Lastes dynamisk her i stedet for som statisk tagg i hver enkelt fil, så alt
 * som måler trafikk står på ETT sted. Dekker alle sider som laster nav.js —
 * inkludert de 463 SSR-genererte /quiz/-sidene og forsiden (som laster nav.js
 * kun for sporing; mastheaden over avbryter selv når #cq-masthead mangler). */
(function () {
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return;
    var h = location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return;
    if (location.pathname.toLowerCase().indexOf("/admin") === 0) return; // egen admin skal ikke telles
    var s = document.createElement("script");
    s.type = "module";
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    // Beaconen leser sin egen tagg, så attributtet MÅ settes før innsetting.
    s.setAttribute("data-cf-beacon", '{"token": "b6ab175d9bc545c192154784198209e1"}');
    (document.body || document.head).appendChild(s);
  } catch (_) { /* aldri synlig feil */ }
})();
