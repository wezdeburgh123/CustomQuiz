-- CustomQuiz — daglig fellesquiz: skjema for quiz, forsøk, profiler og ledertavle.
-- Kjør i Supabase → SQL Editor (én gang).

-- ── 1) Dagens quiz (én rad per dato, samme for alle) ──────────────────
create table if not exists public.daily_quiz (
  quiz_date   date primary key,
  theme       text,
  quiz        jsonb not null,
  created_at  timestamptz not null default now()
);
grant select, insert on public.daily_quiz to anon, authenticated;
alter table public.daily_quiz enable row level security;

-- Alle kan lese dagens quiz (offentlig hook, ingen innlogging).
drop policy if exists daily_quiz_read on public.daily_quiz;
create policy daily_quiz_read on public.daily_quiz
  for select to anon, authenticated using (true);

-- Kun innsetting tillatt (ingen update/delete) → en publisert quiz kan ikke overskrives.
drop policy if exists daily_quiz_insert on public.daily_quiz;
create policy daily_quiz_insert on public.daily_quiz
  for insert to anon, authenticated with check (true);

-- ── 2) Profiler (visningsnavn til ledertavla) ─────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
alter table public.profiles enable row level security;

-- Innloggede kan lese alle visningsnavn (ledertavla viser dem).
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated using (true);

-- Men bare endre SIN egen profil.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ── 3) Forsøk (ett per bruker per dag) ────────────────────────────────
create table if not exists public.quiz_attempt (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  quiz_date   date not null,
  score       int  not null,
  total       int  not null,
  created_at  timestamptz not null default now(),
  unique (user_id, quiz_date)
);
grant select, insert on public.quiz_attempt to authenticated;
alter table public.quiz_attempt enable row level security;

-- Bruker kan sette inn og lese KUN sine egne forsøk (streak regnes klient-side).
drop policy if exists attempt_insert_own on public.quiz_attempt;
create policy attempt_insert_own on public.quiz_attempt
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists attempt_read_own on public.quiz_attempt;
create policy attempt_read_own on public.quiz_attempt
  for select to authenticated using (user_id = auth.uid());

-- ── 4) Ukentlig ledertavle (aggregert; omgår per-rad-RLS bevisst) ─────
-- En vanlig view kjører med eierens (postgres) rettigheter og ser derfor
-- alle forsøk — men eksponerer KUN aggregat (visningsnavn + ukesscore),
-- aldri e-post eller enkeltsvar. ISO-uke fra og med mandag.
create or replace view public.weekly_leaderboard as
select
  a.user_id,
  coalesce(nullif(trim(p.display_name), ''), 'Anonym') as display_name,
  sum(a.score)            as week_score,
  count(*)                as days_played,
  max(a.created_at)       as last_played
from public.quiz_attempt a
left join public.profiles p on p.id = a.user_id
where a.quiz_date >= date_trunc('week', (now() at time zone 'Europe/Oslo')::date)::date
group by a.user_id, display_name
order by week_score desc, days_played desc, last_played asc;

grant select on public.weekly_leaderboard to anon, authenticated;
