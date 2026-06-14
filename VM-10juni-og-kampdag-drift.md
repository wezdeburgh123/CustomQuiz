# VM 2026 — runbook for 10. juni + kampdag-drift

> ⚡ **STATUS-OPPDATERING 10. juni ~13:00 (denne økta — autoritativ for §1):**
> §1 #1 Brevo-env ✅ VERIFISERT (LIST_ID=3, WELCOME=5, DAILY_TEMPLATE satt, DAILY_EMAIL_ENABLED=true).
> §1 #2 Redeploy ✅ (to deploys i dag: nedtelling/og-image-fiks + daily_quiz-sikring).
> §1 #3 Rydde-SQL ✅ KJØRT inkl. DEL B — tavla helt nullstilt. NB: «testspillerne» var ekte venner; poeng/ligaer kan ikke gjenopprettes (Free-plan) — de spiller på nytt.
> §1 #4 Auth-testbrukere ✅ N/A — smoke@/teststripe@/slett@ fantes aldri som auth-brukere (verifisert i UI).
> EKSTRA gjort: score-CHECK på event_attempts+quiz_attempt, daily_quiz anon-insert droppet (_daily.js skriver m/service-nøkkel), daily-email.js fått token-vakt + én-per-dag-sperre (sjekk at den er pushet).
> GJENSTÅR: §1 #5 tørrkjøring, #6 åpningskamp-review+seed, #7 kickoff-flip-valg.
> Full funnliste: `AUDIT-rapport-10juni.md`.

> Skrevet 9. juni 2026. Avspark **torsdag 11. juni 2026**, åpningskamp Mexico–Sør-Afrika på Estadio Azteca. Finale 19. juli.
> «C» = Christian (push, secrets, Supabase, nettleser/Stripe). «Cl» = Claude (kode, prompt, faktasjekk, /api-probe).
> Forankret i `VM-LAUNCH-plan.md`, `VM-fotball-prompt.md`, [[customquiz-vm-modul]], [[customquiz-status]].

---

## 0. Det viktigste: ENK-forsinkelsen blokkerer ingenting

Org.nr kommer ikke i tide → ingen Stripe/Vipps live. **Det er greit.** VM er gratis for alle, bevisst (`REQUIRE_SUBSCRIPTION=false`). Betaling er en egen sti som henger på org.nr og er utenfor VM-launchen. Når org.nr lander (kan bli midt i turneringen) kjører du go-live i ro etter `ENK-oppstart-steg-for-steg.md` + `GO-LIVE-hvem-gjor-hva.md` — frikoblet fra VM.

**«Non-destructive åpne» = fravær av handling på betalingssiden:**
- `REQUIRE_SUBSCRIPTION=false` → la stå. Ikke flip paywall.
- `REQUIRE_LOGIN=true` → la stå.
- IKKE sett `STRIPE_TAX_RATE_ID` (ingen MVA før org.nr + 50 000-grensa).
- De lokale, ucommittede MVA-edits i `create-checkout.js`/`stripe-webhook.js` er env-gated og ufarlige uten env. La ligge, eller commit — ingen risiko enten vei.

---

## 1. Onsdag 10. juni — låse launchen

| # | Hvem | Oppgave | Verifisering |
|---|------|---------|--------------|
| 1 | C/Cl | Sett `BREVO_VM_LIST_ID=3` + `BREVO_VM_WELCOME_TEMPLATE_ID=5` i Netlify (Claude kan sette via nettleser) | Env synlig i Netlify |
| 2 | C | Redeploy: Netlify → Deploys → **Trigger deploy** → Deploy site (eller tom commit) | Ny deploy «Published» |
| 3 | C | Kjør `db/rydd-testrader-for-avspark.sql` i Supabase → ledertavlen starter ren | `event_user_scores` viser kun ekte spillere |
| 4 | C | Slett testbrukerne i Supabase → Authentication → Users (smoke@, teststripe@, slett@) | Brukerne borte |
| 5 | C+Cl | **Tørrkjøring som ny bruker:** ny e-post → OTP → spill quiz → opprett liga → få velkomstmail | Alle ledd grønne |
| 6 | C | Review-godkjenn åpningskamp-quizen (`VM-runde-utkast-apningskamp.md`) → seed `locked` | Du har lest alle 10 spm |
| 7 | C | Bevisst valg: VM-mail av/på (`DAILY_EMAIL_ENABLED`, ukentlig) + hvem flipper kickoff til `open` og når | Valg tatt |

**Redeploy-kommando (hvis terminal i stedet for Trigger deploy):**
```
cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
git commit --allow-empty -m "chore: redeploy for VM-env" && git push
```

---

## 2. Torsdag 11. juni — avspark

1. Flip kickoff-innholdet til `open` ved/etter åpningskampen (pre-VM-pakken kan også stå åpen fra nå).
2. Kjør go/no-go-sjekklista (§4) før du deler lenken bredt.
3. Del `vm.html` i kanalene + inviter første liga (`?liga=KODE`).

---

## 3. Kampdag-drift under turneringen (fast rytme)

Innhold låses opp per fase. **Resultatrunder (Modus B) lages først ETTER at kampene er ferdigspilt** — aldri før. Faktakvalitet er ikke-forhandlingsbart: hver runde websøk-grunnes + gjennom et adversarielt faktasjekk-pass før din review-gate (`VM-fotball-prompt.md`).

**4-stegs løype per runde (gjenbrukes hver gang):**
1. **Cl** genererer (websøk, alternativer stokket, faktavakt).
2. **Cl** kjører faktasjekk-pass (egen adversariell runde).
3. **C** review-godkjenner (leser alle 10 spm).
4. **C** seeder: lim inn i `scripts/build-vm-seed.py` → `python3 scripts/build-vm-seed.py` → kjør `db/seed-vm-2026.sql` i Supabase. Ny runde står `locked` til fasen åpner, så flip `locked → open`.

**Når Claude pre-genererer utkastene automatisk** (planlagte påminnelser satt opp 9. juni):

| Runde (Modus B, etter ferdige kamper) | Claude genererer utkast | Fase åpner ca. |
|---|---|---|
| Gruppespill omgang 1 | 15. juni | ~15. juni |
| Gruppespill omgang 2 | 20. juni | ~20. juni |
| Gruppespill omgang 3 + «gruppene avgjort» | 27. juni | ~27. juni |
| 16-delsfinale (R32) | 3. juli | ~3. juli |
| 8-delsfinale (R16) | 7. juli | ~7. juli |
| Kvartfinale | 11. juli | ~11. juli |
| Semifinale | 15. juli | ~15. juli |
| Finale-høydepunkt | 20. juli | finaledag 19. juli |

Utkastene legges i prosjektmappa som `VM-runde-utkast-<dato>.md` og du får varsel. **Du** review-godkjenner og seeder — Claude rører aldri DB direkte.

**Hybrid-topping (Modus A, stabile fakta, valgfritt på store dager):** åpning ✅ (laget), sluttspillstart, finale, evt. Norge-kamper.

**Ukentlig:** rask titt på ledertavle, liga-vekst, Brevo-leveringsrate; rydd åpenbare testrader.
**Aldri:** push live-endringer rett før en kamp uten røyktest av vm.html-flyten.

---

## 4. Go/no-go-sjekkliste (avspark 11. juni)

- [ ] `/vm.html` laster uten JS-feil
- [ ] `migration-marketing-optin.sql` + `migration-vm-events.sql` kjørt (sjekk `db/sjekk-migrasjoner.sql`)
- [ ] Brevo-liste «VM 2026» (ID 3) + `BREVO_VM_LIST_ID` + velkomst-mal (ID 5) satt → redeployet
- [ ] Attempt→ledertavle verifisert ende-til-ende (✅ 8. juni)
- [ ] Opt-in→Brevo→velkomstmail verifisert (✅ 8. juni; verifiser på nytt etter env i §1)
- [ ] Tørrkjøring som ny bruker fullført
- [ ] Åpningskamp-quiz faktasjekket + review-godkjent
- [ ] Testrader tømt; ledertavle starter ren
- [ ] Bevisst valg tatt på VM-mail (av/på)
- [ ] Bestemt hvem som flipper kickoff til `open` og når

---

## 5. Risiko og rollback

| Risiko | Tiltak |
|--------|--------|
| Faktafeil i live-runde | Review-gate er obligatorisk. Kill-switch: `library-flag` / sett `review_status=removed`. |
| Brevo opt-in synker ikke | `recordOptIn` har fallback uten attributter; velkomstmail er gated → feiler stille, blokkerer ikke spill. |
| Git-lås / push feiler | `find .git -name '*.lock' -delete` så push på nytt. Claude kan ikke pushe. |
| Env plukkes ikke opp | Netlify krever ny deploy etter env-endring → Trigger deploy / tom commit. |
| Org.nr lander midt i VM | Kjør Stripe/Vipps go-live i ro etter eget løp; VM fortsetter gratis uansett. |
