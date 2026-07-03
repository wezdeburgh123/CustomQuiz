/**
 * CustomQuiz — avgjør om masthead-introen skal spille på denne sidelasten.
 * --------------------------------------------------------------
 * Settes som html.cq-fresh KUN ved «fersk» inngang:
 *   - kald/direkte (skrevet URL, bokmerke)         → spill intro
 *   - ekstern lenke (annen origin)                 → spill intro
 *   - reload                                       → spill intro (så man ser den ved testing)
 * IKKE fersk (meny står helt stille, ingen intro):
 *   - intern navigasjon (klikk på samme-origin)    → ingen intro
 *   - tilbake/fram (bfcache/historikk)             → ingen intro
 *
 * Mastheaden er ankret av View Transitions (view-transition-name), så posisjon
 * holder seg uansett; dette styrer kun OM penselen/faden spiller på nytt.
 *
 * Må lastes SYNKRONT i <head> (før første paint) på ALLE sider, så CSS-en
 * (som gater intro under html.cq-fresh) ser klassen før mastheaden tegnes.
 *   <script src="intro-state.js"></script>
 *
 * Ingen lagring brukes → ingen private-mode-trøbbel. Reduced-motion → aldri
 * fersk (introen er uansett av).
 */
(function () {
  var root = document.documentElement;

  // Redusert bevegelse: ikke sett cq-fresh — masthead vises statisk uansett.
  try {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) {}

  // Navigasjonstype: "navigate" | "reload" | "back_forward"
  var navType = "navigate";
  try {
    var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
    if (entries && entries[0] && entries[0].type) {
      navType = entries[0].type;
    } else if (performance.navigation) {
      navType = ["navigate", "reload", "back_forward", "reserved"][performance.navigation.type] || "navigate";
    }
  } catch (e) {}

  // Kom vi fra vår egen side?
  var sameOriginRef = false;
  try {
    sameOriginRef = !!document.referrer && document.referrer.indexOf(location.origin) === 0;
  } catch (e) {}

  // Intern = tilbake/fram, eller en vanlig navigasjon med samme-origin referrer (klikk i appen).
  var internal = (navType === "back_forward") || (navType === "navigate" && sameOriginRef);

  if (!internal) root.classList.add("cq-fresh");
})();

/**
 * Cloudflare Web Analytics — besøks-/sidevisningssporing (gratis, cookie-fri).
 * --------------------------------------------------------------
 * Beacon injiseres her fordi denne fila lastes på alle live-sider
 * (index, arkiv, dagens, lag-quiz, min-side, vm) → ett sted å vedlikeholde.
 * Token hentes i Cloudflare → Web Analytics → Add a site (manuell JS-setup)
 * og limes inn under. Sperren under hindrer lasting før ekte token er satt,
 * så dette er trygt å pushe selv før token er på plass.
 */
(function () {
  var CF_TOKEN = "LIM_INN_CLOUDFLARE_TOKEN_HER";
  if (!CF_TOKEN || CF_TOKEN.indexOf("LIM_INN") === 0) return; // ingen ekte token ennå
  try {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(s);
  } catch (e) {}
})();
