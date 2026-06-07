-- CustomQuiz — migrasjon: legg til `team` (klubblag) på quiz_library
-- Kjør i Supabase → SQL Editor (én gang).
--
-- Bakgrunn: Fotball ble skilt ut som egen kategori (category='fotball') med et
-- lag-underfilter i arkivet (arkiv.html). Klubb-quizer tagges med klubbens
-- kanoniske navn i `team` (f.eks. "Liverpool", "Brann"); generelle fotball-
-- emner (VM, Premier League, Eliteserien o.l.) har team = NULL og vises under
-- «Alle lag». Feltet fylles av nattskiftet via library-sync / sync-library.mjs,
-- som leser `team` fra quiz-library/topics.json.
--
-- Trygt å kjøre flere ganger (idempotent på kolonne + indeks).

alter table public.quiz_library
  add column if not exists team text;

-- Indeks for lag-filter-spørringer (category='fotball' + team=…).
create index if not exists quiz_library_team_idx
  on public.quiz_library (team);

-- Etter migrasjonen: re-synk arkivet slik at de eksisterende fotball-quizene
-- får riktig category + team:
--   cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
--   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/sync-library.mjs
-- (eller GET /api/library-sync etter neste deploy).
