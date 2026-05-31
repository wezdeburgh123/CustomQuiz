# Brevo-oppsett + e-postmaler — CustomQuiz

Guide for å sette opp e-postsending via Brevo, og oversikt over de ferdige malene i denne mappa.

Sist oppdatert: 31. mai 2026

---

## Hva som kan gjøres nå (uavhengig av DNS)

1. **Opprett Brevo-konto** på [brevo.com](https://www.brevo.com) — velg gratisplanen (300 e-poster/dag, EU-hostet). Ikke nødvendig med kort.
2. **Last opp malene** under: lim HTML-en inn i Brevo (Campaigns/Templates → ny mal → «Paste your code»). Magic link-malen hører hjemme i Supabase, ikke Brevo (se under).
3. Forbered avsendernavn og emnefelt — forslag ligger i hver mal-fil.

## Hva som venter på at DNS er live (customquiz.no)

4. **Verifiser avsenderdomenet i Brevo:** Senders, Domains & Dedicated IPs → legg til `customquiz.no`. Brevo gir deg DKIM/SPF/DMARC-records → legg dem hos Uniweb (se `../DNS-og-epost-oppsett.md`, steg 3).
   - Husk: kun ÉN SPF-record på domenet — slå sammen Uniweb + Brevo i samme linje.
5. **Koble Brevo som SMTP i Supabase** (for magic link): Supabase → Project Settings → Authentication → SMTP. Host `smtp-relay.brevo.com`, port 587, brukernavn + SMTP-nøkkel fra Brevo. Avsender `hei@customquiz.no`.

---

## Malene i denne mappa

| Fil | Hvor den brukes | Type | Emneforslag |
|---|---|---|---|
| `magic-link.html` | **Supabase** Auth → Email Templates → «Magic Link» | Transaksjonell | Logg inn på CustomQuiz |
| `bekreftelse-double-optin.html` | Brevo (sendes ved ny e-postregistrering) | Transaksjonell | Bekreft e-posten din |
| `velkomst.html` | Brevo (sendes rett etter bekreftelse) | Transaksjonell | Du er inne — her er dagens quiz |
| `kvittering-abonnement.html` | Brevo (sendes ved fullført betaling) | Transaksjonell | Kvittering — CustomQuiz-abonnement |
| `daglig-quiz.html` | Brevo (daglig drypp kl. 07:00) | Marketing/automation | № {{nr}} · {{tema}} — {{teaser}} |

### Variabler

- **Magic link-malen** bruker Supabase-syntaks: `{{ .ConfirmationURL }}`. Ikke endre den.
- **Brevo-malene** bruker Brevo-syntaks `{{ params.navn }}` / `{{ contact.FORNAVN }}`. Plassholdere er markert tydelig i hver fil (f.eks. `{{ params.quiz_url }}`, `{{ params.tema }}`). Bytt dem mot Brevos egne felt når du kobler på automasjonene.

### Stil

Alle malene følger CustomQuiz-identiteten: krem bakgrunn (#F5F0E6), dyp teal signaturfarge (#0A6E5A), Fraunces på overskrifter og JetBrains Mono på eyebrows. Fontene lastes via Google Fonts for klienter som støtter det (Apple Mail m.fl.), med Georgia/Arial som fallback i Gmail/Outlook. Flatt, editorialt, ingen skygger — som papiret.

---

## Resten av flytene (bygges senere)

Fra `../CRM-plan.md` gjenstår: streak-påminnelse (Flyt 3), vennutfordring (Flyt 4) og reaktivering (Flyt 5). Disse bygges når onboarding + daglig drypp står og vi har de første brukerne. Si fra når du vil ha dem.
