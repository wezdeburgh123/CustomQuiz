-- CustomQuiz — temautgaver for dagens quiz (fase 1).
-- Kjør i Supabase → SQL Editor (én gang). ADDITIV og trygg: alt eksisterende
-- fungerer videre. Ledertavla (weekly_leaderboard) røres ikke.
--
-- Mål: «dagens» går fra ÉN delt quiz/dag → FLERE temautgaver/dag (én per
-- kategori), men fortsatt samme-for-alle. Brukeren spiller ÉN utgave per dag
-- (sitt valg), og poengene teller i den samme ukesledertavla — fordi
-- unique(user_id, quiz_date) på quiz_attempt beholdes uendret.

begin;

-- ── 1) daily_quiz: én rad per (dato, kategori) i stedet for én per dato ──
-- Legg til kategori (default 'mix' for bakoverkompatibilitet med eksisterende
-- rader, som var den ene delte quizen).
alter table public.daily_quiz
  add column if not exists category text not null default 'mix';

-- Bytt primærnøkkel fra (quiz_date) → (quiz_date, category).
-- Eksisterende rader får category='mix' via defaulten over, så de blir
-- «mix»-utgaven på sin dato — ingen kollisjon.
alter table public.daily_quiz drop constraint if exists daily_quiz_pkey;
alter table public.daily_quiz add  constraint daily_quiz_pkey primary key (quiz_date, category);

-- Rask oppslag på «alle utgaver for en dato».
create index if not exists daily_quiz_date_idx on public.daily_quiz (quiz_date);

-- ── 2) quiz_attempt: registrer HVILKEN utgave som ble spilt ──
-- Kun for sporing/innsikt. unique(user_id, quiz_date) beholdes → fortsatt
-- nøyaktig ett tellende forsøk per bruker per dag, uansett valgt kategori.
alter table public.quiz_attempt
  add column if not exists category text;

commit;

-- Merk: ingen endring i weekly_leaderboard-viewet. Det aggregerer fortsatt
-- sum(score) per bruker per ISO-uke, og siden det bare kan finnes ett forsøk
-- per dag, teller hver dags valgte utgave likt — felles tavle, intakt streak.
