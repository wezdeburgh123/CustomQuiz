-- CustomQuiz — jobb-lager for async quiz-generering (websøk).
-- Kjør denne i Supabase → SQL Editor (én gang).
--
-- Lagrer kortlevde jobb-statuser som bakgrunnsfunksjonen skriver og
-- poll-endepunktet leser. Ingen sensitiv data; id er en tilfeldig UUID.
-- Bruker permissive RLS for anon-rollen (samme nøkkel som frontend).

create table if not exists public.quiz_jobs (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- PostgREST-tilgang for anon/authenticated (RLS styrer faktisk tilgang).
grant select, insert, update on public.quiz_jobs to anon, authenticated;

alter table public.quiz_jobs enable row level security;

-- Permissive: hvem som helst kan opprette/lese/oppdatere en jobb.
-- Trygt nok her — id er ugjettbar UUID, ingen persondata lagres.
drop policy if exists quiz_jobs_anon_all on public.quiz_jobs;
create policy quiz_jobs_anon_all on public.quiz_jobs
  for all to anon, authenticated
  using (true) with check (true);

-- Valgfri opprydding: slett jobber eldre enn 1 dag. Kjør manuelt ved behov,
-- eller sett opp som pg_cron-jobb senere.
-- delete from public.quiz_jobs where created_at < now() - interval '1 day';
