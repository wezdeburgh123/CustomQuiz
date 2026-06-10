# CustomQuiz — total gjennomgang & audit

> Kjørt 10. juni 2026 (Fable 5). Grunnlag: hele kodebasen (36 funksjoner, 18 SQL-filer, 7 aktive frontend-sider), alle spec-/status-dokumenter, memory, og **live-sjekk av customquiz.no via nettleseren**. Alle funn under er verifisert i kode eller live — ikke spekulasjon.

---

## TL;DR — hvor står vi

Produktet er i mye bedre stand enn dokumentene antyder. VM-modulen (`vm.html`) er **ikke** lenger et plassholder-skall — den er fullt koblet til Supabase og API-ene svarer 200 live (`/api/featured`, `/api/daily-quiz`, `/api/library-list` — 225 quizer i arkivet nå). BASEN (vekst + moderering) er ferdig og pushet. GRATIS-funnelen er i praksis på plass. `main` er i sync med `origin/main` — alt committet er deployet.

Men: turneringen sparker i gang i morgen (11. juni 18:00), og det er **tre ting som er synlig feil på live akkurat nå**, pluss fire datasikkerhetshull i Supabase som lar én person ødelegge ledertavla. Ingenting av dette krever en deploy — det meste fikses med SQL i Supabase + to små frontend-edits.

**Gladnyhet:** Flere "venter på push"-påstander i memory er utdaterte. Commit 739993e, layout-grid-arbeidet og basen-vekst ligger alt på `origin/main`. Memory bør ryddes (se siste seksjon).

---

## 🔴 KRITISK — fiks før avspark (ingen krever deploy)

### 1. Nedtellingen er feil på live NÅ — viser «2 DAGER TIL AVSPARK»
Live akkurat nå (10. juni 12:09) viser `vm.html` **«· 2 DAGER TIL AVSPARK»** og forsiden tilsvarende. Avspark er i morgen. Årsaken: `vm.html:749` og `index.html:1229` bruker `Math.ceil(diff/86400000)` mot et kickoff-tidspunkt kl. 18:00 — fra nå til i morgen 18:00 er ~30 t = 1,3 døgn → `ceil` runder opp til 2. På selve avsparksdagen vil samme logikk vise «1 dag / Avspark i morgen» helt frem til kl. 18.
**Fix (2 enlinjers):** regn mot *start av kampdagen* eller legg inn en «i dag»-gren:
```js
var msLeft = kickoff - Date.now();
var d = Math.ceil(msLeft/86400000);
el.textContent = msLeft <= 0 ? '· avspark i gang!'
  : d <= 1 ? '· avspark i morgen' : '· ' + d + ' dager til avspark';
```
(For å treffe «i dag» når man er på samme kalenderdato som kickoff: sammenlign datodel, ikke bare timer.)

### 2. Testdata ligger fortsatt på live VM-ledertavle
Live viser nå ekte test-ligaer og -spillere: **OrlandosLigaen, VM-3HUM, SjugareLigaen, VM-WS2F, KolbotnLigaen** og spillere **Marius (41), John (40), Christian (25)**. `db/rydd-testrader-for-avspark.sql` finnes men er **ikke kjørt** (DEL B er utkommentert). En helt ny bruker i morgen ser disse navnene.
**Fix:** kjør DEL A + DEL B av rydde-skriptet i Supabase SQL Editor, og slett testbrukerne under Authentication → Users (smoke@, teststripe@, slett@).

### 3. Åpningskamp-quizen er ikke seedet
Quiz-poolen på `vm.html` har **5 fliser** live (de fem pre-VM-quizzene). Slug `apningskamp` finnes ikke i `scripts/build-vm-seed.py`, `db/seed-vm-2026.sql` eller `event-quizzes/vm-2026.json`. Utkastet i `VM-runde-utkast-apningskamp.md` er ferdig faktasjekket og «KLAR FOR REVIEW», men aldri limt inn.
**Fix:** etter din review-gate, lim dicten inn i `QUIZZES` i `build-vm-seed.py` → `python3 scripts/build-vm-seed.py` → kjør oppdatert `seed-vm-2026.sql`. (`hero_img: vm-gruppespill-1` finnes i IMG/.)

### 4. Ledertavla kan jukses fritt — `event_attempts` mangler validering (SQL, ingen deploy)
Verifisert i `db/migration-vm-events.sql:54-70`: `score int not null` har **ingen CHECK-constraint**, og RLS sjekker kun `user_id = auth.uid()` — ikke at score ≤ antall spørsmål. Anon-nøkkelen ligger offentlig i `supabase-config.js`, så enhver innlogget bruker kan via konsollen poste `score: 9999` eller mange forsøk med oppdiktede `quiz_slug`, og `event_user_scores`-viewet summerer alt blindt. Hele VM-tavla og liga-tavlene ryker av én jukser på lanseringsdagen.
**Fix (SQL i kveld):**
```sql
alter table public.event_attempts
  add constraint event_attempts_score_chk
  check (score >= 0 and score <= total and total between 1 and 50);
```
Samme hull i `quiz_attempt` (ukestavla, `migration-daily-quiz.sql`) — legg tilsvarende CHECK der.

### 5. «Dagens quiz» kan forgiftes — anon INSERT-policy på `daily_quiz` (SQL)
Verifisert i `migration-daily-quiz.sql:20-22`: `create policy daily_quiz_insert ... to anon, authenticated with check (true)`. Hvem som helst med den offentlige anon-nøkkelen kan poste neste dags utgave med vilkårlig/støtende innhold; fordi generatoren hopper over kategorier som «finnes», kan angriperens rad vinne og serveres til alle.
**Fix:** dropp insert-policyen for anon, og la `_daily.js` skrive utgaver via service-role-klienten (`_supabase.js`) i stedet for anon-klienten. Lesing kan fortsatt være åpen.

### 6. Hvem som helst kan nedgradere en betalende kunde (kode, 2 filer)
`create-checkout.js:72` (verifisert) gjør `upsertSubscriber({ email, status: "pending" })` uautentisert på vilkårlig e-post → upsert på `email` overskriver `status='active'` med `pending`. Verre i `vipps-agreement.js`: overskriver `vipps_agreement_id` på en aktiv kunde → faller ut av `vipps-charge`-loopen, abonnementet dør stille.
*Ikke VM-blokkerende* (paywall er av under VM), men må fikses før go-live.
**Fix:** sett `pending` kun når rad mangler eller status ikke alt er `active`/`past_due`; lagre Vipps pending-agreement i egen kolonne til callbacken bekrefter.

---

## 🟠 VIKTIG (snart, ikke nødvendigvis i kveld)

- **Klient-side score lagres «stille feil» feil vei.** `dagens.html:666` og `quiz-app-v2.html:2590` har `try/catch` rundt `await sb.from(...).insert(...)`, men supabase-js *kaster ikke* ved DB-feil — den returnerer `{error}`. En RLS-/nettfeil gir 0 poeng uten noe varsel. Bytt til `const {error} = await ...; if (error) ...` + vis «kunne ikke lagre — last på nytt» i event-modus.
- **XSS-flate i quiz-rendereren.** `quiz-app-v2.html:2191` (alternativer) og :2305-2311 (recap: `q.q`, `q.options`, `q.explanation`) settes med `innerHTML` uten escaping. Innholdet kommer bl.a. fra *brukergenererte* arkiv-quizer (source='user'). `dagens.html` gjør dette riktig med `textContent`. Bytt til textContent/escape.
- **Offentlig flagging kan tømme arkivet (DoS).** `library-flag.js` setter `review_status='flagged'` umiddelbart ved én uautentisert rapport. Et lite skript over `/api/library-list` kan skjule alt fra arkiv + forside. Krev N≥3 rapporter før auto-skjuling, eller bare varsle moderator første døgnet. (VM-quizene berøres ikke.)
- **`/api/daily-email` er en uautentisert massesend-trigger** når `DAILY_EMAIL_ENABLED=true`. Hvem som helst kan loope den og spamme opt-in-lista. Krev `ADMIN_TOKEN` ved HTTP-kall.
- **`leagues`-lesepolicy er `using (true)`** (`migration-vm-events.sql:88`) → enhver innlogget kan liste *alle* ligaer med kode og navn, dvs. finne og hoppe inn i private vennegrupper. Stram til medlemskap, eller aksepter bevisst for VM-uka.
- **`subscription-status` lekker abonnement-status for vilkårlig e-post** (uautentisert GET). Krev Bearer-JWT (mønsteret finnes i `cancel-subscription.js`).
- **OG/Twitter-bilder er relative URL-er** (`vm.html:22` m.fl.) → delingsbilder ryker når VM-lenker deles i Slack/iMessage/Facebook. Gjør dem absolutte (`https://customquiz.no/IMG/...`). 5 enlinjers — verdt det rett før mye lenkedeling.
- **To hardkodede plassholdertekster i vm.html** (`#quiz-progress` = «2 av 7 fullført», `#lb-scope-title` = «Din liga · Kontoret ⚽»). De overskrives av ekte data når JS kjører (live viste «5 av 5» / «DinamoLigaen»), men står synlig til lasting fullfører og blir hengende permanent hvis Supabase-CDN feiler. Sett nøytral default («—»/«Stilling»).
- **Avhengig av jsDelivr-CDN.** `vm.html` og `dagens.html` er 100 % avhengige av at supabase-js lastes fra CDN (`auth.js:194`). På et bedriftsnett som blokkerer CDN er VM-siden tom. Vurder å self-hoste supabase-js i repoet.
- **Prisavvik 39 vs 49 kr:** den ucommittede `e-post-flows.html`-diffen sier 39 kr, men `vipps-agreement.js:24`/`vipps-charge.js:38` har `AMOUNT_ORE = 4900` og `stripe-webhook.js` fallback `49`. Avklar reell pris og synk (gjør gjerne env-styrt `PRICE_NOK`) før Vipps go-live.

---

## ⚡ QUICK WINS / mer elegante løsninger

Frontend-arkitekturen er ren der det teller (delte `layout.css`, `nav.js`, `reveal.js`, `intro-state.js` brukes konsekvent). Gevinsten ligger i inline-duplisering som har begynt å drive fra hverandre:

1. **`:root`-designsystemet er kopiert inn i alle 7 HTML-filene** (~60-90 linjer hver). vm.html mangler allerede `--success/--danger` som dagens har. → én `theme.css` fjerner ~400 linjer og stopper driften. **Største enkeltgevinst.**
2. **Kategori→farge-mappingen finnes i 4 navn med små avvik** (`CAT_SPOT`/`CATEGORY_TO_SPOT`/`LIB_CAT_SPOT`/`CATEGORY_SPOT`) — `sport` er `saffron` ett sted, `cobalt` et annet. Samme for `TEAM_TO_CREST`/`crestFor()` (3 kopier). → én delt `cq-maps.js`, eller la `/api/featured` levere farge/crest-feltet ferdig.
3. **`startCheckout()` + betalingsmodalen er duplisert** i `arkiv.html` og `quiz-app-v2.html` (kommentert «holdes i synk» — klassisk felle). → delt `cq-checkout.js`.
4. **JS-hjelpere duplisert 3-5 steder:** `esc()`/`escapeHtml()`, «vent på CQAuth-klient»-polling (3 navn), `computeStreak` (med **ulik logikk** i dagens vs. min-side!). → én `cq-utils.js`, ~150 linjer spart + én reell bug ryddet.
5. **Backend:** Vipps-klienten (`baseUrl`+`getToken`) er kopiert i 4 filer; e-postregex i 3; JWT-verifisering i 2; `MONTHS_NB` i 2; `reply`/JSON-headers i 5. → `_vipps.js` + `_helpers.js`. Lavrisiko opprydding etter VM.
6. **CORS er inkonsistent:** quiz/arkiv sender `Allow-Origin: *`, betalings-/liga-endepunkter sender ingenting og svarer 405 på OPTIONS-preflight. Velg én linje (helst dropp `*` — alt er same-origin).
7. **`ADMIN_TOKEN` sammenlignes med `===`** (`library-flag.js:73`, `library-recategorize.js:33`) → bruk `crypto.timingSafeEqual`. `library-recategorize` godtar token i GET-URL → gjør POST-only (token havner ellers i access-logger).

---

## 🗑️ DØDE FILER (kan arkiveres/slettes)

Verifisert at ingen er lenket fra aktive sider eller delt JS: `klinikk-quiz*.html`, `moby-quiz.html`, `oslo-quiz*.html` (4), `quiz.html`, `quiz-2*.html`, `quiz-v2.html`, `the-weeknd-quiz*.html`, `yungblud-quiz*.html`, `mockup-kategori-spotcolor.html`, og `quizzes.js` (refereres kun fra de døde sidene). De 6 legacy-quizene lever videre som `mix-10/11`, `geografi-08/09`, `vitenskap-08`, `musikk-15` i arkivet — verifisert at alle 6 id-er finnes.
**Anbefaling:** ikke bare slett — gamle URL-er er bokmerkbare/indekserte. Legg 301-redirects i `netlify.toml` (`/oslo-quiz.html → /quiz-app-v2.html?quiz=geografi-08`) og rydd filene. `auth-confirm.html` er IKKE død (retur-mål for magic-link-fallback) — behold.

---

## 📋 Gap: planer vs. faktisk bygget

| Spec | Status | Gap |
|------|--------|-----|
| VM-modul | 🟡 nesten | Kun ett kode-gap: åpningskamp ikke seedet (pkt. 3 over). Backend + frontend ellers komplett og live. |
| GRATIS-funnel | 🟡 i hovedsak | 12 gratis-quizer ✅, arkiv-toggle ✅, «Hva nå?» ✅. Mangler: fotball 3/lag (venter på lag-quizer), server-side free-håndheving (først ved paywall). |
| BASEN (vekst+moderering) | ✅ ferdig + pushet | Kun kosmetisk rest: død `rating`-CSS/fallbackdata i arkiv.html. |
| Layout 1080 | ✅ landet på main | `layout-grid`/`layout-fluid-frame`-branchene har 0 commits foran main — kan slettes. |
| GO-LIVE / betaling | ✅ kode klar | Venter kun på org.nr + manuelle Christian-steg. `vipps-agreement.js` bruker `pricing.type:"LEGACY"` — verifiser mot dagens Vipps-API før test. |
| PROJECT-INSTRUCTIONS.md | 🟡 delvis utdatert | §3 «maks 760px» (reversert til 1080), §6 «6 gratis/84 premium» (nå 12/95+), VM-modulen nevnes ikke i det hele tatt, db-lista mangler 13 migrasjoner. |

**Memory-rettelser** (flere «venter på push» er feil): commit 739993e er i origin/main; basen-vekst er pushet; layout-arbeidet er merget. `customquiz-status.md` bør oppdatere disse + at vm.html er live (ikke plassholder) + at arkivet nå har 225 quizer.

---

## ✅ Det som faktisk er solid (verifisert)

Webhook-sikkerhet der det teller: Stripe verifiserer signatur på rå body; vipps-callback stoler aldri på callbacken men henter avtalestatus server-til-server. `generate-quiz` mot Anthropic er reelt gated (krever abonnement → feiler lukket ved env-feil, DB-cache + ordliste-moderering foran). `vipps-charge` har idempotency-nøkkel mot dobbelttrekk. Liga-funksjonene (create/join/leave) har ekte Bearer-JWT-verifisering + service-role-skriving + kollisjonsretry. `event_attempts`-lesing eksponerer ikke andres forsøk (RLS verifisert). Ingen service-role-/Stripe-/Brevo-nøkler i koden. Ingen JS-konsollfeil på vm.html live.

---

## Anbefalt rekkefølge i kveld (alt uten deploy unntatt der nevnt)

1. **SQL i Supabase:** score-CHECK på `event_attempts` + `quiz_attempt` (pkt. 4) → dropp `daily_quiz` anon-insert (pkt. 5) → kjør `rydd-testrader-for-avspark.sql` DEL A+B (pkt. 2).
2. **Slett testbrukere** i Auth → Users.
3. **Seed åpningskampen** etter din review (pkt. 3).
4. **To frontend-edits + commit + deploy:** nedtellings-«i dag»-gren (pkt. 1) + nøytrale vm.html-defaults + absolutte og:image-URL-er. Ta med de ucommittede MVA-edits i samme commit (env-gated, ufarlige).
5. **Tørrkjøring** som ny bruker (ny e-post → OTP → spill → opprett liga → velkomstmail) + bekreft `BREVO_VM_LIST_ID=3`/`BREVO_VM_WELCOME_TEMPLATE_ID=5` er satt.
6. Etter VM, i ro: nedgraderings-buggen (pkt. 6), flag-rate-limit, theme.css-konsolideringen, slett døde filer m/redirects.
