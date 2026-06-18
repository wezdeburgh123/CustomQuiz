-- CustomQuiz — spor hvem som genererte en bruker-quiz.
-- Legger til created_by på quiz_library. Settes kun for source='user'
-- (nightly/seed forblir null). Idempotent — trygt å kjøre på nytt.
-- Kjør i Supabase → SQL Editor (én gang).

alter table public.quiz_library
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Indeks for raske «hvor mange unike generatorer»-tellinger.
create index if not exists quiz_library_created_by_idx
  on public.quiz_library (created_by);

-- Tellespørring (unike generatorer + per bruker):
--   select count(distinct created_by) as unike_generatorer
--   from public.quiz_library where source = 'user' and created_by is not null;
