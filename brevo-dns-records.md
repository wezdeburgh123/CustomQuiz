# Brevo DNS-poster for customquiz.no

Lest fra Brevo (CustomQuiz-konto) 1. juni 2026. Disse legges inn hos DNS-leverandøren (one.com / Uniweb). Brevo gjenkjente leverandøren som One.com.

| # | Type | Hostname (vert) | Verdi |
|---|------|-----------------|-------|
| Brevo-kode | TXT | `@` (blank — apex) | `brevo-code:767f85aa4c00428f090630ee4cf01231` |
| DKIM 1 | CNAME | `brevo1._domainkey` | `b1.customquiz-no.dkim.brevo.com` |
| DKIM 2 | CNAME | `brevo2._domainkey` | `b2.customquiz-no.dkim.brevo.com` |
| DMARC | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

## Brevo SMTP (for Supabase custom SMTP)

- **Server:** `smtp-relay.brevo.com`
- **Port:** `587`
- **Login / brukernavn:** `ad14d6001@smtp-brevo.com`
- **Passord:** Brevo SMTP-nøkkel (genereres i Brevo → SMTP & API → «Generate SMTP key»; hemmelig, lim inn i Supabase selv)
- Avsender i Supabase: `hei@customquiz.no`, navn `CustomQuiz`

## Merknader

- Brevos nyere autentisering krever **ikke** en egen SPF-record her (DKIM-CNAME-ene + brevo-kode holder for autentisering). SPF (`include:spf.brevo.com`) er fortsatt anbefalt for leveringsdyktighet og kan legges til senere — én samlet SPF-linje på apex.
- DMARC starter mykt (`p=none`) — kun overvåking, blokkerer ingenting. Kan strammes til senere.
- Etter at postene er lagt inn og propagert: trykk «Authenticate this email domain» i Brevo. Kan ta opptil 48 t, ofte minutter.
- **Mottak (MX):** domenet har i dag «null MX» (`0 .`) = avviser all e-post. Må fikses separat hvis `hei@`/`slett@` skal kunne motta.
