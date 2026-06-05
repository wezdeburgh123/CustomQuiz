-- CustomQuiz — quiz_library (permanent quiz-arkiv / cache).
-- Kjør denne i Supabase → SQL Editor (én gang).
--
-- Formål: ett varig lager for ferdiggenererte quizer, slik at ENHVER
-- forespørsel på siden først kan slå opp her (via `slug`) før vi bruker
-- Anthropic-API-et. Treff = gratis, momentant svar. Bom = generér og lagre.
--
-- Fylles av:
--   1) Nattlig genererings-skift (Claude-konto, ikke API) → skriver til
--      repo-fila quiz-library/library.ndjson → `library-sync`-funksjonen
--      upserter hit ved deploy.
--   2) Live-generatorene (generate-quiz / quiz-generate-background): når en
--      bruker treffer et NYTT tema, lagres resultatet her (source='user').
--
-- Nøkkel = `slug`: en kanonisk, deterministisk streng utledet av
-- (temaer + nivå). Samme normalisering i netlify/functions/_library.js og i
-- det nattlige skriptet, så oppslag alltid matcher.

create table if not exists public.quiz_library (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,          -- kanonisk nøkkel, f.eks. "romerriket__medium"
  themes          text[] not null,               -- rå temaer slik de ble etterspurt
  category        text not null default 'mix',   -- én av de 12 kategori-nøklene (se _library.js)
  category_label  text,                           -- visningsnavn, valgfritt
  difficulty      text not null default 'medium', -- lett | medium | vanskelig
  title           text,
  lede            text,
  questions       jsonb not null,                 -- [{category,q,options[4],correct,explanation}]
  num_questions   int generated always as (jsonb_array_length(questions)) stored,
  hero_img        text,                           -- f.eks. "kategori-geografi" (uten sti/extension)
  source          text not null default 'nightly',-- nightly | user | seed
  model           text,                           -- hvilken modell som genererte (sporing)
  grounded        boolean not null default false, -- ble websøk-grunnet?
  plays           int not null default 0,
  rating          numeric(2,1) not null default 4.5,
  published       boolean not null default true,  -- vises i arkiv + serveres som cache
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists quiz_library_category_idx   on public.quiz_library (category);
create index if not exists quiz_library_difficulty_idx  on public.quiz_library (difficulty);
create index if not exists quiz_library_published_idx   on public.quiz_library (published);
create index if not exists quiz_library_created_idx     on public.quiz_library (created_at desc);

-- updated_at-trigger (gjenbruker funksjonen fra schema.sql hvis den finnes).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quiz_library_touch on public.quiz_library;
create trigger quiz_library_touch
  before update on public.quiz_library
  for each row execute function public.touch_updated_at();

-- ──────────────────────────────────────────────────────────────
-- RLS: alle kan LESE publiserte quizer (arkiv + cache-oppslag fra frontend).
-- Skriving skjer kun fra serverless med service_role-nøkkel (omgår RLS), så
-- ingen insert/update-policy for anon.
-- ──────────────────────────────────────────────────────────────
alter table public.quiz_library enable row level security;

drop policy if exists "les publiserte quizer" on public.quiz_library;
create policy "les publiserte quizer"
  on public.quiz_library for select
  to anon, authenticated
  using (published = true);
