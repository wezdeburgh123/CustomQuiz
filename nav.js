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

  var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  function active(file) { return path === file ? " is-active" : ""; }

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
      '<a href="dagens.html" class="masthead-link' + active("dagens.html") + '">Daglig quiz</a>' +
      '<span class="masthead-sep">·</span>' +
      '<a href="quiz-app-v2.html" class="masthead-link' + active("quiz-app-v2.html") + '">Generator</a>' +
    "</nav>";

  if (document.getElementById("cq-nav-style")) return;
  var css =
    "#cq-masthead.masthead{border-top:1px solid var(--rule-strong,#C9BD9F);border-bottom:1px solid var(--rule-strong,#C9BD9F);padding:20px 0;margin-bottom:48px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;}" +
    "#cq-masthead .masthead-logo{display:inline-flex;align-items:center;gap:6px;text-decoration:none;transition:opacity .2s ease;}" +
    "#cq-masthead .masthead-logo:hover{opacity:.82;}" +
    "#cq-masthead .masthead-mark{height:44px;width:44px;object-fit:contain;display:block;border-radius:0;}" +
    "#cq-masthead .masthead-wordmark{font-family:var(--font-display,Georgia,serif);font-style:italic;font-weight:500;font-size:20px;line-height:1;letter-spacing:-.01em;color:var(--ink,#1F1A14);}" +
    "#cq-masthead .masthead-meta{display:flex;align-items:center;gap:14px;font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute,#7A6F5A);flex-wrap:wrap;}" +
    "#cq-masthead .masthead-link{color:var(--ink,#1F1A14);text-decoration:none;transition:color .2s ease;border-bottom:1px solid transparent;padding-bottom:1px;}" +
    "#cq-masthead .masthead-link:hover{color:var(--accent,#0A6E5A);border-bottom-color:var(--accent,#0A6E5A);}" +
    "#cq-masthead .masthead-link.is-active{color:var(--accent,#0A6E5A);border-bottom-color:var(--accent,#0A6E5A);}" +
    "#cq-masthead .masthead-link-vm{color:var(--spot-saffron,#C68A2E);}" +
    "#cq-masthead .masthead-link-vm:hover{color:var(--spot-saffron,#C68A2E);border-bottom-color:var(--spot-saffron,#C68A2E);}" +
    "#cq-masthead .masthead-link-vm.is-active{color:var(--spot-saffron,#C68A2E);border-bottom-color:var(--spot-saffron,#C68A2E);}" +
    "#cq-masthead .masthead-sep{color:var(--rule-strong,#C9BD9F);}" +
    "#cq-masthead .cq-auth-link{color:var(--accent,#0A6E5A);}" +
    "@media(max-width:560px){#cq-masthead.masthead{gap:12px;}#cq-masthead .masthead-meta{font-size:10px;gap:10px;}}";
  var s = document.createElement("style");
  s.id = "cq-nav-style";
  s.textContent = css;
  document.head.appendChild(s);
})();
