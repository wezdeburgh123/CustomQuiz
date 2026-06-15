# Gratis-periode — slå på (15. juni 2026)

Mål: ingen betaling. To nivåer:
- **Anonym** — spille alt som er cachet (arkiv, Dagens, VM). Ingen innlogging. (Allerede slik.)
- **Innlogget** — kan *lage egne quizer*, **maks 2 per dag**. Cachede treff (tema finnes i arkivet) er gratis og teller ikke.

Det eneste som koster penger er AI-generering av *nye* quizer. Vernet er server-side: 2/dag per bruker + et globalt dagstak (kill-switch).

Tre steg for å gå live. Jeg kan gjøre steg 1 og 2 i nettleseren din hvis du vil — si fra.

---

## Steg 1 — Kjør SQL-en i Supabase (én gang)

1. Gå til **supabase.com** → prosjektet ditt → **SQL Editor** → **New query**.
2. Lim inn ALT under, trykk **Run**:

```sql
create table if not exists public.gen_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  email       text,
  day         date not null,
  created_at  timestamptz not null default now()
);
create index if not exists gen_usage_user_day_idx on public.gen_usage (user_id, day);
create index if not exists gen_usage_day_idx       on public.gen_usage (day);
alter table public.gen_usage enable row level security;
```

(Samme innhold ligger i `db/migration-gen-usage.sql`.)

---

## Steg 2 — Sett miljøvariabler i Netlify

Netlify → siden din → **Site configuration** → **Environment variables**. Sjekk/sett disse:

| Navn | Verdi | Hva den gjør |
|------|-------|--------------|
| `REQUIRE_LOGIN` | `true` | Krever innlogging for å generere |
| `REQUIRE_SUBSCRIPTION` | `false` | Skrur AV betaling/paywall |
| `DAILY_GEN_LIMIT` | `2` | Maks genereringer per bruker per dag (valgfri — 2 er default) |
| `GLOBAL_GEN_CAP` | `400` | Hardt dagstak totalt = kostnadssperre (valgfri — 400 er default) |

Du trenger strengt tatt bare de to øverste; de to nederste er default i koden hvis du dropper dem. `GLOBAL_GEN_CAP` er sikkerhetsnettet ditt — senk det hvis du vil ha strammere kostnadskontroll.

---

## Steg 3 — Deploy

Pushe koden til Git, så bygger Netlify automatisk. Si fra hvis du vil at jeg hjelper med pushen.

---

## Sånn skrur du betaling PÅ igjen senere

Ingenting er slettet — kun satt i dvale:
1. Netlify: sett `REQUIRE_SUBSCRIPTION=true`.
2. Frontend (`quiz-app-v2.html`): bytt `ensureCanGenerate()` tilbake til den strenge `ensureAccess()` (se kommentaren i fila).

Bonus: `gen_usage`-tabellen logger all bruk, så du har ekte tall på hvor mye folk genererer når du skal prise riktig.
