-- ════════════════════════════════════════════════════════════════════
-- AVSPARK-SIKRING — kjøres 10. juni 2026, kvelden før VM-avspark
-- Lim hele fila inn i Supabase → SQL Editor → Run.
--
-- VIKTIG REKKEFØLGE: Kjør denne ETTER at _daily.js-fiksen er deployet
-- («Published» i Netlify). Blokk 4 fjerner anon-skrivetilgangen til
-- daily_quiz — uten deployen ville kveldens 20:00-generering feilet.
--
-- Trygt å kjøre flere ganger (idempotent).
-- Gjør: (1) sletter testrader, (2) nullstiller VM-tavla helt,
-- (3) jukse-sperre på ledertavlene, (4) tetter daily_quiz-hullet,
-- (5) kontrollspørringer til slutt.
-- ════════════════════════════════════════════════════════════════════


-- ── 1) Slett alle spor for navngitte test-e-poster ────────────────────
-- (christian@dinamo.no er med så DU også starter på null — fjern linjene
--  med din e-post hvis du vil beholde dine egne forsøk.)

delete from public.event_attempts
 where user_id in (select id from auth.users where email in (
   'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'));

delete from public.league_members
 where user_id in (select id from auth.users where email in (
   'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'));

delete from public.quiz_attempt
 where user_id in (select id from auth.users where email in (
   'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'));

delete from public.profiles
 where id in (select id from auth.users where email in (
   'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'));

delete from public.payment_events
 where email in ('smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no');

delete from public.subscribers
 where email in ('smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no');


-- ── 2) Full nullstilling av VM-ledertavla (DEL B fra rydde-skriptet) ──
-- Fjerner ALLE forsøk og test-ligaer for vm-2026 (Kong Christian, karen,
-- Scott, OrlandosLigaen, DinamoLigaen osv.) → avspark starter helt rent.

delete from public.event_attempts where event_id = 'vm-2026';
delete from public.league_members
  where league_id in (select id from public.leagues where event_id = 'vm-2026');
delete from public.leagues where event_id = 'vm-2026';


-- ── 3) Jukse-sperre: score må være gyldig ──────────────────────────────
-- Uten dette kan enhver innlogget bruker poste score:9999 via konsollen
-- (anon-nøkkelen er offentlig) og toppe både VM- og ukestavla.
-- NOT VALID = gjelder alle NYE rader, validerer ikke gamle (raskt og trygt).

alter table public.event_attempts
  drop constraint if exists event_attempts_score_chk;
alter table public.event_attempts
  add constraint event_attempts_score_chk
  check (score >= 0 and score <= total and total between 1 and 50) not valid;

alter table public.quiz_attempt
  drop constraint if exists quiz_attempt_score_chk;
alter table public.quiz_attempt
  add constraint quiz_attempt_score_chk
  check (score >= 0 and score <= total and total between 1 and 50) not valid;


-- ── 4) Tett daily_quiz-hullet ──────────────────────────────────────────
-- Anon INSERT-policyen lot hvem som helst forhåndsplante morgendagens
-- quiz med vilkårlig innhold (insert-only → kunne ikke overskrives).
-- Serveren skriver nå med service-nøkkelen (deployet i _daily.js).

drop policy if exists daily_quiz_insert on public.daily_quiz;
revoke insert on public.daily_quiz from anon, authenticated;


-- ── 5) Kontroll ────────────────────────────────────────────────────────
-- a) VM-tavla skal være TOM:
select 'VM-tavle' as sjekk, count(*) as rader
  from public.event_user_scores where event_id = 'vm-2026';

-- b) Ligaer for vm-2026 skal være 0:
select 'VM-ligaer' as sjekk, count(*) as rader
  from public.leagues where event_id = 'vm-2026';

-- c) Constraints på plass (skal vise 2 rader):
select conname as sjekk, conrelid::regclass as tabell
  from pg_constraint
 where conname in ('event_attempts_score_chk','quiz_attempt_score_chk');

-- d) daily_quiz-policyer (daily_quiz_insert skal IKKE være i lista):
select polname as policy from pg_policy
 where polrelid = 'public.daily_quiz'::regclass;
