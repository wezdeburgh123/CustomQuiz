-- CustomQuiz — migrasjon: legg til `free` (gratis-bibliotek-flagg) på quiz_library
-- Kjør i Supabase → SQL Editor (én gang). Idempotent.
--
-- Bakgrunn: gratis-funnelen (GRATIS-funnel-spec.md, 7. juni 2026) gir e-post-
-- nivået tilgang til et fast, kuratert gratis-bibliotek. De 12 generelle gratis-
-- quizene ligger i den statiske quizzes-data.json (free:true der). Dette feltet
-- bærer det samme flagget for quizer som kommer fra DB-arkivet (quiz_library) —
-- primært fotball-quizer per lag (minst 3 åpne per lag), som genereres av
-- nattskiftet og synkes via library-sync / sync-library.mjs fra topics.json.
--
-- free = true  → permanent åpen for innlogget e-post-nivå (ikke bak paywall)
-- free = false → krever Premium-abonnement

alter table public.quiz_library
  add column if not exists free boolean not null default false;

-- Indeks for «vis kun gratis»-spørringer i arkivet.
create index if not exists quiz_library_free_idx
  on public.quiz_library (free);

-- Etter migrasjonen: re-synk arkivet så eksisterende rader får free-flagget
-- fra topics.json / library.ndjson:
--   cd "/Users/christian/Documents/Claude/Projects/Quiz generator"
--   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/sync-library.mjs
-- (eller GET /api/library-sync etter neste deploy).
