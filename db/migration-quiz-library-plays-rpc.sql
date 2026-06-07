-- CustomQuiz — migrasjon: atomisk plays-teller på quiz_library
-- Kjør i Supabase → SQL Editor (én gang). Idempotent.
--
-- Bakgrunn: forsidas «populær»-utvalg (fase 3) sorterer/pinner på plays. For å
-- unngå race-condition (les → +1 → skriv) ved samtidige spill, gjør vi
-- inkrementet atomisk i databasen via denne funksjonen. Kalles fra
-- netlify/functions/library-play.js (med service-rolle) når en arkiv-quiz spilles.
--
-- (plays-kolonnen finnes allerede i quiz_library — ingen ny kolonne her.)

create or replace function public.increment_quiz_plays(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.quiz_library
     set plays = plays + 1
   where slug = p_slug;
$$;

-- La både anon, innlogget og service-rolle kalle den (vi kaller fra serverless,
-- men grant gjør den også trygt kallbar direkte ved behov senere).
grant execute on function public.increment_quiz_plays(text) to anon, authenticated, service_role;
