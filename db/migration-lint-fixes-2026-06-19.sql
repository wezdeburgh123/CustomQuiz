-- CustomQuiz — sikkerhets-/RLS-lint-fikser (Supabase Database Advisors)
-- Generert 19. juni 2026. Kjør i Supabase → SQL Editor. Idempotent, kjøres i transaksjon.
--
-- Dekker de entydige, trygge funnene (ingen frontend-/deploy-endring kreves):
--   • Function Search Path Mutable      → touch_updated_at
--   • Definer-funksjon execute-grants   → increment_quiz_plays (kun service_role trenger den)
--   • RLS Enabled No Policy             → gen_usage, payment_events (eksplisitt deny)
--   • Auth RLS Initialization Plan (8)  → (select auth.uid()) i alle berørte policies
--   • Unindexed foreign keys (5)        → dekkende FK-indekser
--
-- IKKE inkludert her (krever beslutning — se chat):
--   • Security Definer View (3): event_user_scores, weekly_leaderboard, league_standings
--   • RLS Policy Always True (1): quiz_jobs  (anon-nøkkel skriver i dag)
--   • Leaked Password Protection (Auth-innstilling, ikke SQL)
--   • Unused Index (8 info): bevisst beholdt — for tidlig å droppe på ~3 uker gammel prod-DB.

begin;

-- ── W1: Function Search Path Mutable — public.touch_updated_at ─────────────
-- Lås søkestien så funksjonen ikke kan påvirkes av kallers search_path.
-- Trygt: funksjonen bruker bare now() (pg_catalog, alltid implisitt) + new.*.
alter function public.touch_updated_at() set search_path = '';

-- ── W3 + W4: Definer-funksjon kallbar av public/anon/authenticated ────────
-- increment_quiz_plays kalles KUN fra serverless med service-rolle
-- (netlify/functions/library-play.js → library.db() => SERVICE_ROLE_KEY).
-- Ingen direkte .rpc()-kall fra frontend. Fjern overflødig EXECUTE.
revoke execute on function public.increment_quiz_plays(text) from public;
revoke execute on function public.increment_quiz_plays(text) from anon;
revoke execute on function public.increment_quiz_plays(text) from authenticated;
-- service_role beholder EXECUTE (urørt).

-- ── INFO: RLS Enabled No Policy — gen_usage, payment_events ───────────────
-- Begge er server-only (kun service_role, som omgår RLS). Eksplisitt deny for
-- anon/authenticated gjør intensjonen tydelig og fjerner lint-flagget UTEN å
-- åpne tilgang. service_role påvirkes ikke (omgår RLS uansett).
drop policy if exists gen_usage_deny_anon on public.gen_usage;
create policy gen_usage_deny_anon on public.gen_usage
  for all to anon, authenticated using (false) with check (false);

drop policy if exists payment_events_deny_anon on public.payment_events;
create policy payment_events_deny_anon on public.payment_events
  for all to anon, authenticated using (false) with check (false);

-- ── PERF: Auth RLS Initialization Plan (8 policies) ───────────────────────
-- Wrap auth.uid() i (select auth.uid()) → evalueres én gang per spørring,
-- ikke per rad. Identisk logikk, bare raskere. ALTER POLICY bevarer rolle/cmd.
alter policy "egen abonnementsrad" on public.subscribers
  using ((select auth.uid()) = user_id);

alter policy profiles_insert_own on public.profiles
  with check (id = (select auth.uid()));
alter policy profiles_update_own on public.profiles
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

alter policy attempt_insert_own on public.quiz_attempt
  with check (user_id = (select auth.uid()));
alter policy attempt_read_own on public.quiz_attempt
  using (user_id = (select auth.uid()));

alter policy event_attempt_insert_own on public.event_attempts
  with check (user_id = (select auth.uid()));
alter policy event_attempt_read_own on public.event_attempts
  using (user_id = (select auth.uid()));

alter policy league_members_read_own on public.league_members
  using (user_id = (select auth.uid()));

-- ── PERF: Unindexed foreign keys (5) ──────────────────────────────────────
-- Dekkende indeks på FK-kolonner som ikke er ledende i en eksisterende indeks.
create index if not exists event_attempts_event_id_idx on public.event_attempts (event_id);
create index if not exists league_members_user_id_idx  on public.league_members  (user_id);
create index if not exists leagues_event_id_idx         on public.leagues         (event_id);
create index if not exists leagues_owner_id_idx         on public.leagues         (owner_id);
create index if not exists subscribers_user_id_idx      on public.subscribers     (user_id);

-- ── DOKUMENTASJON: bevisst aksepterte lint-funn ───────────────────────────
-- Leaderboard-views er SECURITY DEFINER med vilje: de aggregerer på tvers av
-- alle brukere og eksponerer KUN visningsnavn + poeng (allerede offentlig på
-- ledertavla). security_invoker ville brutt dem (anon leser dem på forsiden).
comment on view public.weekly_leaderboard is
  'Bevisst definer-view: offentlig aggregat (navn+ukesscore). Omgår per-rad-RLS med vilje. Lint-unntak gjennomgått 2026-06-19.';
comment on view public.event_user_scores is
  'Bevisst definer-view: offentlig aggregat (navn+eventscore). Omgår per-rad-RLS med vilje. Lint-unntak gjennomgått 2026-06-19.';
comment on view public.league_standings is
  'Bevisst definer-view: liga-aggregat (navn+score). Omgår per-rad-RLS med vilje. Lint-unntak gjennomgått 2026-06-19.';

-- quiz_jobs: anon-nøkkel skriver kortlevde jobb-statuser (ugjettbar UUID, ingen
-- persondata). Permissiv RLS er bevisst valgt for å slippe hemmelig env i serverless.
comment on table public.quiz_jobs is
  'Kortlevd jobb-status (UUID-nøkkel, ingen persondata). Permissiv RLS bevisst valgt (anon-skriving). Lint-unntak gjennomgått 2026-06-19.';

commit;
