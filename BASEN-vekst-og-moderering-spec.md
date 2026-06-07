# Basen: vekst, synlighet og moderering — spec

_7. juni 2026. Hvordan genererte quizzer blir synlige, hvordan forsida og arkivet
trekker fra en voksende base, og hvordan vi sikrer mot sensitive tema._

---

## Mål

La quiz-basen vokse **organisk** med tema folk faktisk bryr seg om, gjøre den
veksten **synlig** (forside + arkiv), og gjøre det **trygt** — ingen umoderert
brukerinput skal kunne ende offentlig på hjemmesida.

## Beslutninger (7. juni 2026)

1. **Moderering:** Auto-publisering, men kun etter at temaet passerer (a) en
   deterministisk ordliste og (b) en AI-sjekk. Med rapport-knapp + admin
   kill-switch som sikkerhetsnett.
2. **Forside:** Pinnet Allmenn/Sport/Fotball + roterende kategorier + en
   «Nylig laget av fellesskapet»-stripe (kun godkjente).
3. **Arkiv:** Egen, fysisk adskilt fellesskaps-seksjon, atskilt fra det kuraterte.

---

## Nåtilstand (det som allerede finnes)

- **Lagring er bygd.** `generate-quiz.js` og `quiz-generate-background.js` kaller
  `library.saveQuiz({… source:"user"})` når en bruker treffer et nytt tema.
  Idempotent på `slug`. `grounded:true` når websøk var på.
- **Servering er bygd.** `library-list.js` lister alt `published` (nyeste først);
  `library-get.js` serverer én quiz på `?slug=`. Skallet spiller den via `?lib=<slug>`.
- **DB-felt finnes allerede:** `source` (nightly|user|seed), `grounded`, `free`,
  `team`, `plays`, `rating`, `published`. (`source` selektes ikke i `library-list.js` ennå.)

### Hull som må tettes

- **Ingen moderering.** `sanitizeInput` kutter kun lengde. Alt blir `published:true`
  umiddelbart — offentlig i arkivet og servert som cache til alle.
- **Ingen admin/rapport.** Ingenting kan av-publiseres eller flagges etter at det er ute.
- **`plays` telles aldri.** Ingen endepunkt bumper den, så «populær»-sortering har
  ikke datagrunnlag ennå.
- **Forsida er hardkodet.** De utvalgte kortene (`index.html` ~981–1047) peker til
  gamle statiske prototyp-HTML-filer, ikke til basen.

---

## A. Moderering + publiseringsport

Prinsipp: **koble fra «servér som cache» og «vis offentlig».** Brukeren får alltid
quizen sin i svaret. Om den skal *listes* offentlig avgjøres av portene under.

### Lag 1 — deterministisk ordliste (før generering, gratis)

Ny fil `netlify/functions/_moderation.js`:

- `screenThemes(themes)` → `{ ok:true }` eller `{ ok:false, category, reason }`.
- Blokkerer kun **eksplisitt ulovlig/egregiøst**: hatord/slurs, seksuelt innhold
  m/mindreårige, eksplisitt seksuelt, oppskrifter på våpen/eksplosiver/narkotika,
  doxxing/utheng av navngitt privatperson, selvskade-oppskrifter.
- Normaliser før match: lowercase, fjern diakritikk, slå sammen mellomrom/leetspeak
  (`s3x`, `s e x`) for å hindre triviell omgåelse.
- **Viktig avveining:** lista skal treffe *intensjon/eksplisitte ord*, IKKE
  tema-ord. «Drap», «våpen», «krig» er legitime historie-/museum-tema — de skal
  IKKE blokkeres her. Nyansen håndteres av Lag 2.
- Treff → returnér vennlig 422 (`code:"blocked_topic"`), **ikke** kall modellen,
  **ikke** lagre.

### Lag 2 — AI-sjekk (nyansen, gjenbruker eksisterende rør)

`extractJSON` håndterer allerede `insufficient_knowledge`-objektet. Vi legger til et
parallelt avslags-objekt i prompten (`_quizcore.js`, `buildPrompt`):

```
Hvis temaet er upassende for en offentlig quiz (hets mot en gruppe, sjikane av en
navngitt privatperson, oppfordring til vold, eller åpenbart smakløst/krenkende),
returnér KUN: {"blocked": true, "reason": "kort norsk begrunnelse"}
```

- `generateQuiz` returnerer `{ ok:false, blocked:true, reason }` → endepunktene
  svarer 422 (`code:"blocked_topic"`) og lagrer ikke.
- Dette fanger det subjektive/kontekstuelle som en ordliste ikke kan.

### Lag 3 — publiseringsstatus + sikkerhetsnett

Passerer begge porter → `saveQuiz` med `published:true` (auto-publisert, som valgt).
Men auto-publisering trenger en angre-knapp:

- Ny kolonne `review_status text default 'auto_ok'` (`auto_ok` | `flagged` | `removed`).
- `library-list` / `library-get` / `findByThemes` krever `published=true AND review_status <> 'removed'`.
- **Rapport-knapp** på fellesskaps-quizzer → nytt endepunkt `library-flag.js`
  setter `review_status='flagged'` og skjuler quizen fra lista til den er vurdert.
- **Admin kill-switch:** enkel beskyttet handling (token i env, à la `BREVO_WEBHOOK_SECRET`)
  for å sette `removed`. Holder det lett — du er eneste moderator i starten.
- Valgfritt: lagre blokkerte tema som negativ cache (`published:false`) så vi ikke
  bruker API på samme dårlige tema igjen. (P2.)

---

## B. Forside — dynamisk utvalg

Erstatt de hardkodede kortene i `index.html` med et dynamisk utvalg.

### Nytt endepunkt `netlify/functions/featured.js`

Returnerer ett lett objekt:

- **Pinnet (3):** beste quiz i hver av `mix` (Allmenn), `sport`, `fotball` —
  sortert på `plays` desc, fallback nyeste. Alltid med.
  **Kun `plays` — ALDRI `rating`.** rating-kolonnen er en død default (4.5) uten
  ekte vurderingssystem; den skal ikke brukes til sortering/pinning eller vises
  som stjerner før et faktisk rating-system er bygd (eget, senere prosjekt).
- **Roterende (3–4):** én quiz fra hver av et utvalg *andre* kategorier, valgt med
  en **dagsfrø-rotasjon** (samme utvalg hele dagen, ikke per innlasting) — da kan
  svaret caches 5 min som resten, og den lange halen får eksponering over tid.
- **Fellesskap (3):** nyeste `source='user' AND published=true AND review_status='auto_ok'`.

Kortene lenker til `quiz-app-v2.html?lib=<slug>` (samme spiller som arkivet).

**Konsekvens å være obs på:** per-innlasting-tilfeldighet ville brutt HTTP-cache og
gitt «hoppende» forside. Derfor dagsfrø, ikke `Math.random()` per request.

---

## C. Arkiv — egen fellesskaps-seksjon

- `library-list.js`: legg `source` til `select(...)`; støtt `?source=user|curated`.
  (`curated` = `source in ('nightly','seed')`.)
- `arkiv.html`: ny seksjon/fane **«Laget av fellesskapet»** under det kuraterte,
  med egen overskrift og en kort forklaring («Quizzer andre har bedt om — sjekket
  automatisk»). Rapport-knapp per kort her.
- Kuratert seksjon viser `source in ('nightly','seed')`; fellesskap viser `source='user'`.

---

## D. Organisk vekst + datakvalitet

- **Tell `plays`.** Nytt lite endepunkt `library-play.js` (eller RPC) som bumper
  `plays` når en arkiv-quiz startes. Uten dette har «populær»-pinning og -sortering
  ikke grunnlag. **Forutsetning for B.**
- **Rating er ikke bygd.** `rating`-kolonnen (default 4.5) fylles aldri av ekte
  brukere. Rydd vekk det misvisende: fjern «Høyest rating»-sortering i arkiv.html
  og fake stjerner i index.html/arkiv-kort til et reelt rating-system finnes.
- **Nær-duplikater.** Slug dedupliserer eksakt tema+nivå. Semantisk match er utsatt
  (P2). Lett gevinst nå: alias-/normaliseringslag i `makeSlug` (f.eks. «2. verdenskrig»
  ↔ «andre verdenskrig»), som notert i tidligere beslutning.
- **Kvalitet før synlighet.** Vurdér å kun løfte fellesskaps-quizzer til forsida når
  `grounded=true` og `num_questions >= 8`, så stripa holder nivå.

---

## DB-migrasjon (`db/migration-quiz-library-moderation.sql`)

```sql
alter table public.quiz_library
  add column if not exists review_status text not null default 'auto_ok';
create index if not exists quiz_library_review_idx on public.quiz_library (review_status);
-- (plays finnes allerede; ingen ny kolonne der.)
```

## Fil-oversikt

**Nye:**
`netlify/functions/_moderation.js`, `featured.js`, `library-flag.js`, `library-play.js`,
`db/migration-quiz-library-moderation.sql`.

**Endres:**
`_quizcore.js` (blocked-objekt i prompt + retur), `generate-quiz.js` +
`quiz-generate-background.js` (kall `screenThemes` før gen; håndtér `blocked`;
sett `review_status`), `_library.js` (`findByThemes` ekskl. `removed`; `saveQuiz`
default `review_status`), `library-list.js` (+`source`, `?source`-filter,
ekskl. `removed`), `library-get.js` (ekskl. `removed`), `index.html` (dynamisk
utvalg), `arkiv.html` (fellesskaps-seksjon + rapport-knapp).

## Foreslått rekkefølge

1. **Sikkerhet først** (A, lag 1–3 + migrasjon). Ingenting annet bør live før denne.
2. **`plays`-telling** (D) — liten, men forutsetning for forsida.
3. **Forside** (B).
4. **Arkiv-seksjon** (C).
5. Finpuss: alias-slug, kvalitetsterskel, negativ cache (P2).

## Åpne spørsmål

- Hvor streng ordliste? (Forslag: start smalt/eksplisitt, utvid på erfaring — færre
  falske positive er viktigere enn å fange alt på lag 1, siden lag 2 finnes.)
- Egen e-postvarsling til deg når noe flagges? (Kan henge på Brevo-oppsettet.)
- Skal fellesskaps-stripa på forsida vises for utloggede, eller kun innloggede?
