/**
 * CustomQuiz — delt innlogging (Supabase magic link)
 * ---------------------------------------------------
 * Last ETTER supabase-config.js på hver side:
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *
 * auth.js gjør selv jobben med å:
 *   - laste supabase-js fra CDN
 *   - injisere en «Logg inn»-kontroll i masthead + en login-modal
 *   - håndtere retur fra magic link
 *   - eksponere window.CQAuth { getUser, getEmail, signIn, signOut, onChange, isPremium }
 *   - sende CustomEvent 'cq-auth' på <document> når status endres
 *
 * Bruker sidens egne CSS-variabler (--accent, --bg, …), så det matcher temaet.
 */
(function () {
  var CFG = window.CQ_SUPABASE || {};
  var configured = CFG.url && CFG.anonKey && !/PASTE_/.test(CFG.url) && !/PASTE_/.test(CFG.anonKey);
  var client = null;
  var currentUser = null;

  // ── 1) Stil ────────────────────────────────────────────────
  function injectStyle() {
    if (document.getElementById("cq-auth-style")) return;
    var css = `
      .cq-auth-chip{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.12em;text-transform:uppercase;}
      .cq-auth-link{background:none;border:none;cursor:pointer;color:var(--accent,#0A6E5A);font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:0;}
      .cq-auth-link:hover{color:var(--accent-deep,#074538);}
      .cq-auth-modal{display:none;position:fixed;inset:0;background:rgba(31,26,20,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:200;padding:20px;overflow-y:auto;align-items:flex-start;justify-content:center;padding-top:60px;}
      .cq-auth-modal.active{display:flex;}
      .cq-auth-card{background:var(--bg,#F5F0E6);border:.5px solid var(--rule-strong,#C9BD9F);border-radius:var(--r-card,16px);max-width:420px;width:100%;padding:34px 30px;text-align:center;}
      .cq-auth-card .eyebrow{font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#0A6E5A);margin-bottom:12px;}
      .cq-auth-card h3{font-family:var(--font-display,serif);font-size:26px;font-weight:500;color:var(--ink,#1F1A14);margin:0 0 8px;}
      .cq-auth-card p{font-family:var(--font-sans,sans-serif);font-size:14px;color:var(--ink-soft,#4B4338);line-height:1.5;margin:0 0 20px;}
      .cq-auth-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid var(--rule-strong,#C9BD9F);border-radius:var(--r-md,8px);background:var(--bg-soft,#FBF7EE);font-family:var(--font-sans,sans-serif);font-size:15px;color:var(--ink,#1F1A14);margin-bottom:12px;}
      .cq-auth-input:focus{outline:none;border-color:var(--accent,#0A6E5A);}
      .cq-auth-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:15px 24px;background:var(--accent,#0A6E5A);color:var(--bg-soft,#FBF7EE);border:1px solid var(--accent,#0A6E5A);border-radius:var(--r-pill,999px);font-family:var(--font-sans,sans-serif);font-size:14px;font-weight:600;letter-spacing:.03em;cursor:pointer;}
      .cq-auth-btn:hover{background:var(--accent-deep,#074538);border-color:var(--accent-deep,#074538);}
      .cq-auth-msg{font-family:var(--font-sans,sans-serif);font-size:13px;color:var(--accent-deep,#074538);min-height:18px;margin-top:12px;line-height:1.4;}
      .cq-auth-msg.error{color:#B05238;}
      .cq-auth-close{background:none;border:none;color:var(--ink-mute,#7A6F5A);cursor:pointer;font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:16px 0 0;}
      .cq-auth-close:hover{color:var(--accent,#0A6E5A);}
    `;
    var s = document.createElement("style");
    s.id = "cq-auth-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ── 2) Login-modal ─────────────────────────────────────────
  function injectModal() {
    if (document.getElementById("cq-auth-modal")) return;
    var wrap = document.createElement("div");
    wrap.className = "cq-auth-modal";
    wrap.id = "cq-auth-modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = `
      <div class="cq-auth-card">
        <div class="eyebrow">Innlogging</div>
        <h3>Få en lenke på e-post</h3>
        <p>Skriv inn e-posten din, så sender vi en innloggingslenke. Ingen passord.</p>
        <input class="cq-auth-input" id="cq-auth-email" type="email" inputmode="email" autocomplete="email" placeholder="Din e-post" aria-label="E-post">
        <button class="cq-auth-btn" id="cq-auth-send" type="button">Send innloggingslenke</button>
        <div class="cq-auth-msg" id="cq-auth-msg"></div>
        <button class="cq-auth-close" id="cq-auth-close" type="button">Lukk</button>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) { if (e.target.id === "cq-auth-modal") closeLogin(); });
    document.getElementById("cq-auth-close").addEventListener("click", closeLogin);
    document.getElementById("cq-auth-send").addEventListener("click", sendLink);
    document.getElementById("cq-auth-email").addEventListener("keydown", function (e) { if (e.key === "Enter") sendLink(); });
  }

  function openLogin() {
    injectModal();
    var msg = document.getElementById("cq-auth-msg");
    msg.textContent = ""; msg.classList.remove("error");
    if (currentUser && currentUser.email) document.getElementById("cq-auth-email").value = currentUser.email;
    document.getElementById("cq-auth-modal").classList.add("active");
    setTimeout(function () { var f = document.getElementById("cq-auth-email"); if (f) f.focus(); }, 60);
  }
  function closeLogin() {
    var m = document.getElementById("cq-auth-modal");
    if (m) m.classList.remove("active");
  }

  async function sendLink() {
    var msg = document.getElementById("cq-auth-msg");
    var email = (document.getElementById("cq-auth-email").value || "").trim().toLowerCase();
    msg.classList.remove("error");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.classList.add("error"); msg.textContent = "Skriv inn en gyldig e-post."; return; }
    if (!client) { msg.classList.add("error"); msg.textContent = "Innlogging er ikke konfigurert ennå."; return; }
    msg.textContent = "Sender …";
    try {
      var redirect = location.origin + "/min-side.html";
      var res = await client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirect } });
      if (res.error) throw res.error;
      msg.textContent = "Sjekk innboksen — lenken er på vei til " + email + ".";
    } catch (err) {
      msg.classList.add("error"); msg.textContent = "Klarte ikke sende lenke: " + (err.message || err);
    }
  }

  // ── 3) Header-kontroll ─────────────────────────────────────
  function mountHeaderControl() {
    var nav = document.querySelector(".masthead-meta") || document.querySelector(".masthead nav") || document.querySelector(".masthead");
    if (!nav || document.getElementById("cq-auth-control")) return;
    var span = document.createElement("span");
    span.id = "cq-auth-control";
    span.style.marginLeft = "10px";
    nav.appendChild(span);
    renderHeader();
  }
  function renderHeader() {
    var el = document.getElementById("cq-auth-control");
    if (!el) return;
    if (currentUser) {
      el.innerHTML = '<a class="cq-auth-link" href="min-side.html">Min side</a>';
    } else if (configured) {
      el.innerHTML = '<button class="cq-auth-link" id="cq-auth-open">Logg inn</button>';
      var b = document.getElementById("cq-auth-open");
      if (b) b.addEventListener("click", openLogin);
    } else {
      el.innerHTML = "";
    }
  }

  // ── 4) Init + Supabase-klient ──────────────────────────────
  function loadSupabase() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) return resolve();
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = resolve; s.onerror = function () { reject(new Error("supabase-js lastet ikke")); };
      document.head.appendChild(s);
    });
  }

  function emitChange() {
    document.dispatchEvent(new CustomEvent("cq-auth", { detail: { user: currentUser } }));
  }

  async function init() {
    injectStyle();
    mountHeaderControl();
    if (!configured) { return; } // viser ingenting før config er fylt inn
    try {
      await loadSupabase();
      client = window.supabase.createClient(CFG.url, CFG.anonKey, {
        auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
      });
      var got = await client.auth.getUser();
      currentUser = (got && got.data && got.data.user) || null;
      renderHeader(); emitChange();
      client.auth.onAuthStateChange(function (_evt, session) {
        currentUser = (session && session.user) || null;
        renderHeader(); emitChange();
      });
    } catch (err) {
      // Stillegående — siden fungerer fortsatt uten innlogging.
      if (window.console) console.warn("[auth]", err.message || err);
    }
  }

  // ── 5) Offentlig API ───────────────────────────────────────
  window.CQAuth = {
    getUser: function () { return currentUser; },
    getEmail: function () { return currentUser ? currentUser.email : null; },
    // Den innloggede Supabase-klienten — brukes til DB-spørringer (quiz_attempt,
    // profiles, ledertavle) som RLS-sikres på brukerens egen sesjon.
    getClient: function () { return client; },
    // Supabase access_token (JWT) — sendes som Bearer til serverless for verifisering.
    getAccessToken: async function () {
      if (!client) return null;
      try { var r = await client.auth.getSession(); return (r && r.data && r.data.session && r.data.session.access_token) || null; }
      catch (_) { return null; }
    },
    signIn: openLogin,
    signOut: async function () { if (client) { await client.auth.signOut(); } currentUser = null; renderHeader(); emitChange(); },
    onChange: function (cb) { document.addEventListener("cq-auth", function (e) { cb(e.detail.user); }); if (currentUser) cb(currentUser); },
    isConfigured: function () { return configured; },
    // Sjekker abonnementsstatus via serverless (server er sannheten).
    isPremium: async function () {
      var email = window.CQAuth.getEmail();
      if (!email) return false;
      try {
        var r = await fetch("/api/subscription-status?email=" + encodeURIComponent(email));
        var d = await r.json();
        return !!d.active;
      } catch (_) { return false; }
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
