# CRM-plan for Allmennkunnskap

Hvordan vi gjør email-listen til vekstmotoren i MVP-fasen — og hva som må være på plass før, under og etter første lansering.

Sist oppdatert: 27. mai 2026

---

## 1. Strategien i én setning

Email er **eneste retention-kanal vi eier i v1** (ingen push, ingen app). Den må derfor gjøre tre ting samtidig: bringe folk tilbake daglig (vane), spre appen videre (vennelenker), og gi oss et publikum vi kan selge abonnement til i v2.

Modalen vi nettopp bygde er *gateway-en*. Resten av planen er hva som skjer **etter** at noen skriver inn epost.

---

## 2. Tech-stack — billig, lean, GDPR-trygt

| Lag | Valg | Hvorfor | Kost |
|---|---|---|---|
| Lagring av kontakter | **Supabase `subscribers`-tabell** (allerede i stacken) | Én kilde til sannhet; vi kan joine mot `quiz_results` for segmentering | 0 |
| Transaksjonell + marketing send | **Brevo** (tidl. Sendinblue) — EU-hosted | GDPR-compliant out-of-the-box, billig, gode automasjoner | 0 opptil 300/dag, deretter ~24 €/mnd opptil 20k |
| Alternativ | Loops eller Resend | Resend = bedre DX, Loops = bedre marketing-UI. Brevo vinner på pris + EU. | — |
| Event-trigger | **Supabase Edge Function** → Brevo API | Hold logikken vår, ikke ekstern automasjon | 0 |
| Sporing | Brevo gir åpning/klikk; vi logger `last_active_at` i Supabase | Drypper inn i samme datavarehus som quiz-data | 0 |

**Beslutning:** Start med Brevo. Vi kan flytte senere — kontaktene er våre i Supabase.

---

## 3. Datamodell — hva vi faktisk lagrer

```sql
-- Supabase
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  created_at timestamptz default now(),
  confirmed_at timestamptz,          -- double opt-in
  unsubscribed_at timestamptz,
  source text,                        -- 'gate-modal', 'paywall', 'invite'
  first_quiz_score numeric,           -- snapshot fra triggermoment
  quizzes_taken_at_signup int,
  preferred_themes text[],            -- fylles fra adferd
  streak_at_signup int,
  brevo_contact_id text
);

create table email_events (
  id bigserial primary key,
  subscriber_id uuid references subscribers,
  type text,         -- 'sent' | 'open' | 'click' | 'bounce' | 'unsub'
  campaign text,
  occurred_at timestamptz default now()
);
```

**Hvorfor `quizzes_taken_at_signup`:** Vi vil måle om "etter 2 quizer"-triggeren er riktig terskel, eller om 1 / 3 / 5 konverterer bedre. Uten å lagre det vet vi aldri.

---

## 4. Email-flyt — fra signup til vane

### Flyt 1: Welcome (kjøres umiddelbart)

**Mål:** Bekreft, lever første gevinst, sett forventning.

| Tid | Email | Innhold |
|---|---|---|
| T+0 min | Bekreftelseslenke (double opt-in) | Kort. Én CTA: "Bekreft eposten din". |
| T+0 min (etter bekreft) | Velkommen | "Du er inne. Her er dagens quiz: [lenke]." Sett tonen — Fraunces-overskrift, kort lede, én knapp. |
| T+24 t | Dag 1-quiz | Første ekte daglig-quiz på epost. |
| T+72 t | "Hvordan vil du ha det?" | Mini-preferanseskjema: tema-favoritter + send-tidspunkt. Lagres i `preferred_themes`. |

### Flyt 2: Daglig drypp (kjernen i vanen)

**Mål:** Bli en del av morgenrutinen.

- Send kl 07:00 (lokaltid via Brevo-segment) på hverdager.
- Helg: én lengre "lørdagsquiz" kl 09:00.
- Tema: følger den faste ukerytmen + en mix-dag.
- Subject-formel: `№ {{nr}} · {{tema}} — {{teaser}}` (f.eks. `№ 47 · Oslo — hvor lå Klingenberg kino?`).
- Innhold: én preview-spørsmål inline + "Ta hele quizen →"-knapp. Aldri hele quizen i eposten — vi vil at de skal tilbake til appen.

### Flyt 3: Streak-trigger

**Mål:** Loss aversion. Folk hater å miste streaks.

- Trigger: dag 2 uten quiz når brukeren har ≥ 3 dagers streak.
- Kort, varm tone: *"Du har 5 dager på rad. Vil du ta dagens før klokka tolv?"*
- Maks 1 i uka. Hvis ignorert 2 ganger → pause til ny streak.

### Flyt 4: Vennutfordring (vekstmotoren)

**Mål:** K-faktor > 0.3. Hver innlogget bruker drar inn 1 venn for hver 3.

- Etter en god skår (≥ 8/10): vis "Slå denne skåren — utfordre en venn"-knapp i appen.
- Generer delbar lenke `customquiz.no/u/{token}` som låser quiz-ID og din skår.
- Mottakeren ser: "Christian fikk 8/10 på dagens Oslo-quiz. Slå ham."
- Når mottakeren fullfører → tilbake til gate-modalen med ekstra perk: *"Christian inviterte deg — bli med så får dere begge ukentlig duell."*
- Logg `source = 'invite'` + `invited_by` så vi måler viralitet.

### Flyt 5: Reaktivering

**Mål:** Hent tilbake sovende.

- Trigger: 14 dager uten åpning eller klikk.
- "Vi har savnet deg" + en quiz tilpasset deres tidligere favorittema.
- Hvis ignorert 30 dager til → "Vi pauser daglige eposter. Klikk her hvis du vil tilbake." Beskytter sender-rep.

---

## 5. Segmentering — fra dag 1

Selv med få brukere, sett opp tre segmenter:

1. **Power** — har tatt ≥ 5 quizer siste 7 dager. Disse skal vi spørre om feedback, invitere til betauke for v2-features, og senere selge årlig abonnement til.
2. **Casual** — 1–4 quizer siste 7 dager. Standard dryppflyt. Mål: oppgrader til Power.
3. **Slumrende** — ingen aktivitet siste 14 dager. Reaktiveringsflyt.

Synkroniser segmentene daglig fra Supabase → Brevo via Edge Function.

---

## 6. Targets vi måler mot

Sett baseline etter første 2 uker, så juster.

| Metrikk | MVP-mål (3 mnd) | Hvorfor |
|---|---|---|
| Gate-modal vist → epost gitt | **18 %** | Bransje-benchmark for soft modals er 8–12 % — vi er over fordi triggeren er adferdsbasert |
| Double opt-in fullført | **70 %** | Lavt = problem med bekreftelses-emailen (havner i spam, dårlig subject) |
| Daglig epost — åpning | **35 %** | Newsletter-snitt i Norden ligger 25–30 %; vi har høyere intensjon |
| Klikk fra epost → app | **20 % av åpnere** | Kjernemålet. Færre = teaseren er for svak |
| K-faktor (invites/aktiv bruker) | **0.3** | Under dette vokser vi ikke organisk |
| 30-dagers retention | **40 %** | Wordle-tier er 50–60 %, vi sikter litt under fordi vi har temabredde |

Sett opp et enkelt **Supabase view** som beregner disse ukentlig — vi trenger ikke analytics-verktøy i v1.

---

## 7. GDPR-sjekkliste (Dinamo-mal)

- [ ] Double opt-in obligatorisk
- [ ] "Avmeldingslenke i hver epost" — Brevo håndterer
- [ ] Personvernerklæring lenket fra gate-modalen (én ekstra `<a>` under fineprint)
- [ ] Behandlingsgrunnlag dokumentert (samtykke, art. 6.1.a)
- [ ] Databehandleravtale med Brevo lagret
- [ ] Sletteflyt: bruker kan be om sletting via `slett@customquiz.no` → manuelt i v1, automatisert i v2
- [ ] Ingen tredjeparts trackere i eposter (UTM-er er greit)

---

## 8. Roadmap — hva som må gjøres når

**Uke 2 av MVP-planen (når Supabase er oppe):**
1. Opprett `subscribers`-tabell + RLS-policies
2. Bytt `TODO`-kommentaren i `submitEmail()` mot ekte POST til `/api/subscribe`
3. Sett opp Brevo-konto, importer transaksjonsmal for bekreftelse
4. Edge Function: ny `subscriber` → opprett kontakt i Brevo + send bekreftelse

**Uke 3:**
5. Bygg daglig-quiz-epost-mal (gjenbruk avis-CSS-en, men forenklet for email)
6. Edge Function trigget av `pg_cron` kl 07:00 → henter dagens quiz + sender til segment

**Uke 4 (etter soft launch):**
7. Implementer streak-trigger
8. Bygg invite-lenke (`/u/{token}`) + tracking

**Uke 6–8:**
9. Reaktiveringsflyt
10. Power-segment feedback-email ("hva ville fått deg til å betale 49 kr/mnd?") — direkte input til v2-paywall

---

## 9. Hva vi *ikke* gjør i v1

Bevisste utelatelser så vi holder fokus:

- **Ingen push-notifications.** Krever app-build, vi kjører web-first.
- **Ingen SMS-flow.** For dyrt, og email er mer tolerert i Norge.
- **Ingen "del på sosiale medier"-knapp i hver epost.** Vi sikter på 1:1-deling via vennelenke, ikke spray-and-pray.
- **Ingen lead-magnet ebok eller "100 quizer i PDF".** Quizen *er* magneten.
- **Ingen A/B-testing før vi har 500 abonnenter.** Statistisk støy.

---

## 10. Det første eksperimentet

Når vi har 50 abonnenter: send halve listen daglig-quiz på morgenen, halvparten på kvelden. Se hvilken kohort som har høyest 14-dagers åpningsrate. Det avgjør sendetidspunktet for resten.

Liten test, billig svar, direkte konsekvens for produktet.
