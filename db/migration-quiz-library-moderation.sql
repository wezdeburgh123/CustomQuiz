-- CustomQuiz — migrasjon: review_status (moderering) på quiz_library
-- Kjør i Supabase → SQL Editor (én gang). Idempotent.
--
-- Bakgrunn: bruker-genererte quizzer auto-publiseres når de passerer
-- ordliste-porten (_moderation.js) + AI-sjekken (blocked-objekt i _quizcore.js).
-- Auto-publisering trenger en angre-mekanisme — review_status er sikkerhetsnettet:
--
--   'auto_ok'  → passerte portene, synlig i arkiv + servert som cache (standard)
--   'flagged'  → rapportert av en bruker (library-flag.js), skjult til vurdert
--   'removed'  → tatt ned av admin (kill-switch), aldri synlig/servert
--
-- library-list / library-get / findByThemes krever published=true AND
-- review_status='auto_ok' etter denne migrasjonen.
--
-- (plays-kolonnen finnes allerede i quiz_library — ingen ny kolonne der.)

alter table public.quiz_library
  add column if not exists review_status text not null default 'auto_ok';

-- Defensivt: gyldige verdier.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'quiz_library_review_status_chk'
  ) then
    alter table public.quiz_library
      add constraint quiz_library_review_status_chk
      check (review_status in ('auto_ok', 'flagged', 'removed'));
  end if;
end $$;

create index if not exists quiz_library_review_idx
  on public.quiz_library (review_status);

-- RLS: stram inn lese-policyen så anon/authenticated KUN ser auto_ok-rader.
-- (Skriving skjer fortsatt kun fra serverless med service_role, som omgår RLS.)
drop policy if exists "les publiserte quizer" on public.quiz_library;
create policy "les publiserte quizer"
  on public.quiz_library for select
  to anon, authenticated
  using (published = true and review_status = 'auto_ok');
