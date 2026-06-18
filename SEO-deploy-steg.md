# Deploy: statiske quiz-sider + sitemap (SEO)

_Det jeg har bygd, og nøyaktig hva du gjør for å få det live._

## Hva er bygd

- **`scripts/build-quiz-pages.mjs`** (ny): kjører ved hver Netlify-deploy. Henter alle publiserte quizer fra Supabase (faller tilbake til `library.ndjson` uten DB) og skriver én crawlbar side per quiz: `customquiz.no/quiz/<slug>/`. Hver side har egen tittel, meta-beskrivelse, Open Graph-bilde, JSON-LD (`schema.org/Quiz`), synlige spørsmål og en «Spill quizen»-knapp til den interaktive versjonen. Regenererer også `sitemap.xml` med alle sidene.
- **`netlify.toml`** (endret): build-kommandoen kjører nå generatoren rett etter arkiv-synken. Ikke-blokkerende — en SEO-glipp kan aldri velte selve deployen.
- **`.gitignore`** (endret): `/quiz/`-mappa er build-artefakt og committes ikke (Netlify lager den på nytt hver gang).

Testet lokalt: **207 sider** generert, gyldig JSON-LD, ingen interne 404-lenker, sitemap med 212 URL-er.

---

## ⚠️ Viktig: arbeidsmappa har annet ucommittet arbeid

Da jeg sjekket, lå det allerede flere ucommittede endringer fra før (ikke mine) — bl.a. `arkiv.html`, `_library.js`, de to generatorene og `STATUS.json` (det ser ut som «created_by»-sporingen fra 16. juni), pluss et par VM-utkast og nye `db/migration-*.sql`.

Derfor: **ikke kjør `git add -A`** nå — da blander du inn halvferdig arbeid. Bruk den avgrensede commiten under, som tar KUN SEO-filene.

---

## Steg 1 — Deploy SEO-endringen (din Terminal)

Åpne Terminal og lim inn hele blokka. (Hvis git klager på en lås: `find .git -name '*.lock' -delete` og prøv igjen.)

```bash
cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
git add scripts/build-quiz-pages.mjs netlify.toml .gitignore sitemap.xml SEO-og-trafikk-plan.md SEO-deploy-steg.md
git commit -m "SEO: statiske /quiz/<slug>-sider + full sitemap ved build"
git push
```

Merk: `netlify.toml` inneholder også et par ferdige `/arkiv`-redirects (pene arkiv-URL-er) som lå ucommittet fra før. De følger med i denne commiten — det er ønsket, og gjør at `/arkiv` og `/arkiv/<kategori>` begynner å virke.

Når du har pushet kjører Netlify automatisk en deploy (1–2 min). Build-steget trenger `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` i scope **«Builds»** — de er allerede satt (arkiv-synken bruker dem). Selv om DB skulle feile, faller generatoren tilbake til `library.ndjson` og lager sidene likevel.

## Steg 2 — Sjekk at det ble live

Åpne i nettleser:
- En quiz-side: `https://customquiz.no/quiz/bjornstjerne-bjornson__lett/`
- Sitemap: `https://customquiz.no/sitemap.xml` (skal vise ~200+ URL-er, ikke 5)

## Steg 3 — Si fra til Google (Search Console)

Domenet `customquiz.no` er allerede verifisert i Search Console. Du trenger bare å be Google lese den nye sitemapen:

1. Gå til Google Search Console → **Sitemaps**.
2. Sjekk at `sitemap.xml` står der. Står den allerede, leser Google den på nytt automatisk — men du kan trykke menyen → «Send inn på nytt» for å dytte den.
3. (Valgfritt, men lurt:) gå til **URL-inspeksjon**, lim inn et par quiz-URL-er og trykk «Be om indeksering» for å sette dem fremst i køen.

**Dette steg 3 kan jeg gjøre for deg i nettleseren din** hvis du vil — bare si fra, så sender jeg inn sitemapen på nytt og ber om indeksering på et utvalg sider.

---

## Hva skjer fremover

Hver gang det nattlige skiftet legger nye quizer i arkivet og du deployer, lages sidene + sitemap på nytt automatisk. Nye quizer dukker opp i søk innen Google har crawlet dem (dager, ikke timer). Ingen vedlikehold fra deg.

**Neste SEO-steg når du er klar** (fra `SEO-og-trafikk-plan.md`): kategori-landingssider, unike penge-søk-sider, og en knallsterk Allmennkunnskap-side.
