/**
 * CustomQuiz — delt stegvis innholds-reveal.
 * --------------------------------------------------------------
 * Lar innholdet på en side «etablere seg» raskt og diskret: hvert
 * toppnivå-barn i hovedcontaineren fader/glir inn med en liten
 * forskyvning. Over folden vises alt nesten umiddelbart med kort
 * stagger; under folden trigges det når man scroller dit.
 *
 * Designmål (fra Christian):
 *   - VELDIG raskt og diskret, aldri i veien for vanlig bruk.
 *   - Merkbart sekvensielt, men kort total varighet.
 *
 * Robusthet:
 *   - prefers-reduced-motion → ingen animasjon, innhold vises rått.
 *   - Failsafe-timeout tvinger alt synlig hvis noe skulle gå galt,
 *     så innhold ALDRI blir hengende skjult.
 *   - Pre-hide settes synkront i <head> (denne fila lastes i head)
 *     for å unngå blink → så tagges barna og slippes inn.
 *
 * Brukes IKKE på forsiden (index.html) — den har sin egen bespoke
 * reveal (pre-reveal/is-in). Lenkes i <head> rett etter layout.css:
 *   <script src="reveal.js"></script>
 */
(function () {
  var root = document.documentElement;

  // Hopp helt over ved redusert bevegelse — innhold forblir synlig som normalt.
  var reduce = false;
  try { reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (reduce) return;

  // Pre-hide umiddelbart (synkront i head, før <body> parses) → ingen blink.
  // Vi skjuler kun med opacity her for å unngå layout-hopp under parsing;
  // selve glidningen legges per-element når de tagges.
  root.classList.add("cq-reveal-init");

  var css =
    // Skjul toppnivå-innhold mens siden etableres (masthead/skjult holdes utenfor).
    "html.cq-reveal-init .container > *:not(.masthead):not(#cq-masthead):not(script):not(style):not(link)," +
    "html.cq-reveal-init .wrap > *:not(.masthead):not(#cq-masthead):not(script):not(style):not(link){opacity:0;}" +
    // Reveal-elementenes hvile- og inn-tilstand.
    ".cq-reveal{opacity:0;transform:translateY(12px);transition:opacity .42s ease,transform .42s ease;will-change:opacity,transform;}" +
    ".cq-reveal.cq-in{opacity:1;transform:none;}" +
    "@media (prefers-reduced-motion: reduce){html.cq-reveal-init .container > *,html.cq-reveal-init .wrap > *,.cq-reveal,.cq-reveal.cq-in{opacity:1!important;transform:none!important;transition:none!important;}}";
  var style = document.createElement("style");
  style.id = "cq-reveal-style";
  style.textContent = css;
  (document.head || root).appendChild(style);

  function start() {
    var scope = document.querySelector(".container, .wrap, main");
    if (!scope) { root.classList.remove("cq-reveal-init"); return; }

    // Velg synlige toppnivå-barn (dropp masthead, skript og usynlige noder).
    var items = [];
    var kids = scope.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      var tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") continue;
      if (el.id === "cq-masthead" || el.classList.contains("masthead")) continue;
      if (el.classList.contains("cq-no-reveal")) continue;
      // Hopp over overlays/toasts/sticky-barer (position: fixed/sticky). De
      // styrer sin egen synlighet — reveal-systemets cq-in ville ellers tvinge
      // opacity:1/transform:none på dem (ga «tom mørk pille» / synlig sticky-bar).
      var pos = "";
      try { pos = getComputedStyle(el).position; } catch (e) {}
      if (pos === "fixed" || pos === "sticky") continue;
      items.push(el);
    }

    // Tagg dem og gi slipp på den globale pre-hide (nå holder .cq-reveal dem skjult).
    items.forEach(function (el) { el.classList.add("cq-reveal"); });
    root.classList.remove("cq-reveal-init");

    // Lead kun ved fersk inngang (da animerer menyen og skal lande først). Ved
    // intern nav står menyen stille → ingen grunn til å holde innholdet igjen.
    var LEAD = root.classList.contains("cq-fresh") ? 340 : 0;
    var STAGGER = 42;   // rask, diskret stagger mellom hvert element
    var CAP = 8;        // ikke forskyv mer enn de første N (resten kommer samlet)
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

    function reveal(el, idx) {
      // Lead-pausen gjelder KUN førstegangs-innlasting (innhold over folden), så
      // logoen rekker å komme inn først. Innhold som trigges når man scroller dit
      // skal komme prompt — uten ekstra forsinkelse.
      var lead = (nowMs() - t0 < 450) ? LEAD : 0;
      var d = lead + Math.min(idx, CAP) * STAGGER;
      setTimeout(function () { el.classList.add("cq-in"); }, d);
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(reveal);
      return;
    }

    // Reveal når elementet er (nesten) i view; ellers vent på scroll.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var idx = items.indexOf(el);
        reveal(el, idx < 0 ? 0 : idx);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

    items.forEach(function (el) { io.observe(el); });

    // Failsafe: uansett hva som skjer, vis alt innen 1.2s.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("cq-in"); });
      try { io.disconnect(); } catch (e) {}
    }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
