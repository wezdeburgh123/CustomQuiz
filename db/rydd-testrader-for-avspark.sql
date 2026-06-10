-- ════════════════════════════════════════════════════════════════════
-- Rydd testrader før VM-avspark (11. juni 2026)
-- Kjør i Supabase → SQL Editor. Editoren kjører som postgres → forbi RLS.
-- Trygt å kjøre flere ganger (sletter bare det som matcher).
--
-- NB: Dette sletter DATA-radene, ikke selve innlogging-brukerne.
--     Selve auth-brukerne slettes i Supabase → Authentication → Users
--     (Claude/SQL bør ikke slette auth-brukere — gjør det i UI-et).
-- ════════════════════════════════════════════════════════════════════


-- ── DEL A — Slett alle spor for navngitte test-e-poster ───────────────
-- Juster lista. christian@dinamo.no er din egen test — ta den med hvis du
-- vil ut av VM-ledertavlen, eller kommenter den ut for å beholde deg selv.

-- VM-forsøk (påvirker event_user_scores + league_standings):
delete from public.event_attempts
 where user_id in (
   select id from auth.users where email in (
     'smoke@customquiz.no',
     'teststripe@customquiz.no',
     'slett@customquiz.no',
     'christian@dinamo.no'
   )
 );

-- Liga-medlemskap:
delete from public.league_members
 where user_id in (
   select id from auth.users where email in (
     'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'
   )
 );

-- Daglig-quiz-forsøk (påvirker weekly_leaderboard):
delete from public.quiz_attempt
 where user_id in (
   select id from auth.users where email in (
     'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'
   )
 );

-- Profiler (visningsnavn / opt-in-flagg):
delete from public.profiles
 where id in (
   select id from auth.users where email in (
     'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'
   )
 );

-- Abonnement + betalingslogg (disse er nøklet på e-post):
delete from public.payment_events
 where email in (
   'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'
 );
delete from public.subscribers
 where email in (
   'smoke@customquiz.no','teststripe@customquiz.no','slett@customquiz.no','christian@dinamo.no'
 );


-- ── DEL B (VALGFRITT) — Full nullstilling av VM-ledertavlen ───────────
-- 8. juni-testingen la igjen ~7 spillere (Kong Christian, karen, Scott …)
-- og test-ligaer (Orlandosligaen, VM-3AHQ, VM-3HUM). Vil du at avspark
-- skal starte HELT rent — fjern '-- ' foran linjene under og kjør dem.
-- (Sletter ALLE forsøk/ligaer for vm-2026, uavhengig av bruker.)

-- delete from public.event_attempts where event_id = 'vm-2026';
-- delete from public.league_members
--   where league_id in (select id from public.leagues where event_id = 'vm-2026');
-- delete from public.leagues where event_id = 'vm-2026';


-- ── DEL C — Kontroll: hva står igjen på VM-ledertavlen? ───────────────
select display_name, total_score, quizzes_done, last_played
  from public.event_user_scores
 where event_id = 'vm-2026'
 order by total_score desc;
