-- CustomQuiz — migrasjon: gen_usage (bruks-logg for quiz-generering)
-- Kjør i Supabase → SQL Editor (én gang). Idempotent.
--
-- Bakgrunn: gratis-periode uten betaling (15. juni 2026). Den eneste handlingen
-- som faktisk koster penger er AI-generering av NYE quizer (tokens + websøk).
-- Cachede treff fra arkivet er gratis. Denne tabellen logger én rad per FAKTISK
-- generering (etter cache-bom) og gir to vern:
--   1. Per-bruker daglig limit (env DAILY_GEN_LIMIT, default 2)
--   2. Global daglig kill-switch (env GLOBAL_GEN_CAP, default 400)
-- Bonus: raden er også bruksdata til senere prising når paywallen skrus på igjen.
--
-- Sikkerhet: KUN server-funksjonene (SERVICE_ROLE) skriver/leser dette. RLS er
-- på UTEN anon-policy, så anon/authenticated-nøkkelen i frontend får ingenting.

create table if not exists public.gen_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  email       text,
  day         date not null,                 -- Europe/Oslo-dato (settes av serveren)
  created_at  timestamptz not null default now()
);

-- Rask telling: «hvor mange i dag for denne brukeren» og «hvor mange totalt i dag».
create index if not exists gen_usage_user_day_idx on public.gen_usage (user_id, day);
create index if not exists gen_usage_day_idx       on public.gen_usage (day);

-- RLS på, ingen policy for anon/authenticated → kun SERVICE_ROLE slipper til.
alter table public.gen_usage enable row level security;

-- Valgfri opprydding (kjør manuelt ved behov, eller pg_cron senere):
-- delete from public.gen_usage where day < (current_date - interval '90 days');
