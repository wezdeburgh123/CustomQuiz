-- CustomQuiz — event-moduler (VM 2026 m.fl.): events, quizer, forsøk, ligaer, ledertavler.
-- Kjør i Supabase → SQL Editor (én gang). Deretter db/seed-vm-2026.sql for innholdet.
--
-- Generisk: samme tabeller dekker OL, friidretts-VM, UFC osv. via ulike `events.id`.
-- Speiler mønsteret fra migration-daily-quiz.sql (forsøk lagres klient-side med
-- UNIQUE-constraint; ledertavle er et aggregat-view som omgår per-rad-RLS bevisst).

-- ── 1) Events (ett mesterskap per rad) ───────────────────────────────
create table if not exists public.events (
  id          text primary key,                 -- f.eks. 'vm-2026'
  title       text not null,
  spot_hex    text not null default '#C68A2E',  -- event-spotfarge (saffron for VM)
  starts_at   timestamptz,
  status      text not null default 'live',      -- live | upcoming | done
  created_at  timestamptz not null default now()
);
grant select on public.events to anon, authenticated;
alter table public.events enable row level security;
drop policy if exists events_read on public.events;
create policy events_read on public.events
  for select to anon, authenticated using (true);

-- ── 2) Event-quizer (poolen; spørsmål i jsonb, som quiz_library) ──────
create table if not exists public.event_quizzes (
  id          uuid primary key default gen_random_uuid(),
  event_id    text not null references public.events(id) on delete cascade,
  slug        text not null,                     -- unik pr event, f.eks. 'historie'
  num         text,                              -- visningsnummer, f.eks. '01'
  phase       text,                              -- 'Pre-VM', 'Live · Runde 1', …
  title       text not null,
  sub         text,
  hero_img    text,                              -- 'vm-historie' (uten sti/extension)
  difficulty  text not null default 'medium',
  questions   jsonb not null,                    -- [{category,q,options[4],correct,explanation}]
  num_questions int generated always as (jsonb_array_length(questions)) stored,
  status      text not null default 'open',      -- open | locked  (faseåpning)
  unlock_at   timestamptz,                       -- null = åpen nå
  sort        int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (event_id, slug)
);
create index if not exists event_quizzes_event_idx on public.event_quizzes (event_id, sort);
grant select on public.event_quizzes to anon, authenticated;
alter table public.event_quizzes enable row level security;

-- Alle kan lese publiserte quizer. Spørsmålene inneholder fasit (som dagens
-- quiz og arkivet) — retting skjer klient-side, samme tillitsmodell som resten.
drop policy if exists event_quizzes_read on public.event_quizzes;
create policy event_quizzes_read on public.event_quizzes
  for select to anon, authenticated using (published = true);

-- ── 3) Forsøk (ett per bruker per quiz — håndhever «én gang») ─────────
create table if not exists public.event_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  event_id    text not null references public.events(id) on delete cascade,
  quiz_slug   text not null,
  score       int  not null,
  total       int  not null,
  created_at  timestamptz not null default now(),
  unique (user_id, event_id, quiz_slug)
);
grant select, insert on public.event_attempts to authenticated;
alter table public.event_attempts enable row level security;

-- Bruker kan sette inn og lese KUN egne forsøk. UNIQUE blokkerer ny-forsøk.
drop policy if exists event_attempt_insert_own on public.event_attempts;
create policy event_attempt_insert_own on public.event_attempts
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists event_attempt_read_own on public.event_attempts;
create policy event_attempt_read_own on public.event_attempts
  for select to authenticated using (user_id = auth.uid());

-- ── 4) Ligaer (vennegrupper) + medlemmer ─────────────────────────────
create table if not exists public.leagues (
  id          uuid primary key default gen_random_uuid(),
  event_id    text not null references public.events(id) on delete cascade,
  code        text not null unique,              -- invite-kode, f.eks. 'VM-K9X4'
  name        text not null,
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
grant select on public.leagues to authenticated;
alter table public.leagues enable row level security;
-- Navn er ikke sensitivt; oppslag på id/kode trengs for å vise «din liga».
-- Oppretting/innmelding skjer via serverless (service_role) → ingen insert-policy.
drop policy if exists leagues_read on public.leagues;
create policy leagues_read on public.leagues
  for select to authenticated using (true);

create table if not exists public.league_members (
  id          bigint generated always as identity primary key,
  league_id   uuid not null references public.leagues(id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  unique (league_id, user_id)
);
grant select on public.league_members to authenticated;
alter table public.league_members enable row level security;
-- Bruker ser KUN egne medlemskap (for å liste «mine ligaer»). Innmelding via serverless.
drop policy if exists league_members_read_own on public.league_members;
create policy league_members_read_own on public.league_members
  for select to authenticated using (user_id = auth.uid());

-- ── 5) Ledertavler (aggregat-views — eksponerer kun visningsnavn+poeng) ─
-- Global per event: sum av alle forsøk pr bruker.
create or replace view public.event_user_scores as
select
  a.event_id,
  a.user_id,
  coalesce(nullif(trim(p.display_name), ''), 'Anonym') as display_name,
  sum(a.score)      as total_score,
  count(*)          as quizzes_done,
  max(a.created_at) as last_played
from public.event_attempts a
left join public.profiles p on p.id = a.user_id
group by a.event_id, a.user_id, display_name;
grant select on public.event_user_scores to anon, authenticated;

-- Per liga: medlemmer × deres event-score (filtreres på league_id i frontend).
create or replace view public.league_standings as
select
  lm.league_id,
  l.event_id,
  lm.user_id,
  coalesce(nullif(trim(p.display_name), ''), 'Anonym') as display_name,
  coalesce(s.total_score, 0)  as total_score,
  coalesce(s.quizzes_done, 0) as quizzes_done
from public.league_members lm
join public.leagues l on l.id = lm.league_id
left join public.profiles p on p.id = lm.user_id
left join public.event_user_scores s on s.user_id = lm.user_id and s.event_id = l.event_id;
grant select on public.league_standings to anon, authenticated;
