# Sett opp Supabase + deploy (innlogging live)

Mål: få innlogging (magic link) til å virke på en ekte Netlify-URL. Rekkefølgen under er viktig — særlig steg 5 (Auth-URL), ellers virker ikke magic link.

Project URL er allerede fylt inn i `supabase-config.js`:
`https://agygcltvhkvokgpmwmxf.supabase.co`

---

## 1. Push koden til GitHub
Fra prosjektmappa i Mac-terminalen:
```
git add -A
git commit -m "Betaling + innlogging + innholdslåsing"
git remote add origin https://github.com/<brukernavn>/customquiz.git
git branch -M main
git push -u origin main
```
(Hopp over `remote add` hvis den allerede er satt.)

## 2. Koble Netlify til repoet
Netlify → **Add new site → Import an existing project → GitHub → velg customquiz**.
- Build command: (tom)
- Publish directory: `.`
Deploy. Noter URL-en du får, f.eks. `https://customquiz.netlify.app`. Den kaller vi `SITE_URL` under.

## 3. Hent Supabase-nøklene
Supabase → **Project Settings → API**:
- **anon public** (lang `eyJ…`) — frontend-trygg.
- **service_role** (lang `eyJ…`) — hemmelig, kun server.

## 4. Kjør databaseskjemaet
Supabase → **SQL Editor** → lim inn hele `db/schema.sql` → Run. Skal lage `subscribers` + `payment_events` med RLS.

## 5. Slå på e-post-innlogging + URL-konfig  ← viktigst
Supabase → **Authentication → Providers → Email**: på (magic link er på som standard).
Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://customquiz.netlify.app` (din Netlify-URL)
- **Redirect URLs** (legg til begge):
  - `https://customquiz.netlify.app/min-side.html`
  - `https://customquiz.netlify.app/**`

Uten dette avviser Supabase magic link-lenken.

## 6. Legg inn nøkler to steder

**a) Frontend** — `supabase-config.js`, bytt ut `PASTE_ANON_PUBLIC_KEY_HER` med anon-nøkkelen. (Christian: lim den i chatten, så gjør jeg det.) Commit + push → Netlify redeployer.

**b) Netlify env** — Site settings → Environment variables:
```
SITE_URL                   https://customquiz.netlify.app
SUPABASE_URL               https://agygcltvhkvokgpmwmxf.supabase.co
SUPABASE_ANON_KEY          (anon public — samme som i frontend)
SUPABASE_SERVICE_ROLE_KEY  (service_role — hemmelig)
REQUIRE_SUBSCRIPTION       false      ← av nå, så generering funker mens vi tester innlogging
ANTHROPIC_API_KEY          (finnes allerede)
```
Trigger en ny deploy etter at env er lagt inn (Deploys → Trigger deploy).

## 7. Test ende-til-ende
1. Åpne `https://customquiz.netlify.app`.
2. Klikk **Logg inn** oppe til høyre → skriv e-posten din → "Send innloggingslenke".
3. Sjekk e-post → klikk lenken → du lander på **Min side**.
4. Min side skal vise e-posten din og «Abonnement: Ingen — gratisbruker».

Da står innlogging. Neste: Stripe + Vipps, så flipper vi `REQUIRE_SUBSCRIPTION` til `true`.

## Vanlige feil
- **Lenken sier «invalid» / redirecter ikke:** steg 5 mangler eller URL-en stemmer ikke nøyaktig.
- **«Logg inn» vises ikke:** anon-nøkkel ikke limt inn i `supabase-config.js`, eller deploy ikke kjørt.
- **Min side viser «ikke konfigurert»:** samme — anon-nøkkel mangler i frontend.
