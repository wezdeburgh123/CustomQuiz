-- CustomQuiz — migrasjon: page_views (personvernvennlig trafikkmåling)
-- Kjør i Supabase → SQL Editor (én gang). Idempotent, kjøres i transaksjon.
--
-- Bakgrunn (15. juli 2026): enkel egen trafikkmåling uten tredjepart, i tråd
-- med personvernløftet på forsiden. Vi lagrer KUN aggregerte tall per dag+sti:
--   • views    — antall sidevisninger
--   • visitors — grov «unike besøk»-approksimasjon: klienten sender newVisit=true
--                første gang i dag i den fanen (sessionStorage-flagg). Ingen
--                cookies, ingen IP, ingen user-agent, ingen fingerprinting —
--                det finnes ingen rad per person, bare tellere.
--
-- Sikkerhet (samme konvensjon som migration-lint-fixes-2026-06-19.sql):
--   • RLS på + eksplisitt deny for anon/authenticated (kun service_role,
--     som omgår RLS, leser/skriver — via netlify/functions/track.js).
--   • Teller-funksjonen er SECURITY DEFINER med låst search_path, og
--     EXECUTE er trukket tilbake fra public/anon/authenticated.

begin;

-- ── Tabell: én rad per (dag, sti) — bare tellere, ingen persondata ─────────
create table if not exists public.page_views (
  day      date    not null,               -- Europe/Oslo-dato (settes av serveren)
  path     text    not null,               -- intern sti, uten query/fragment
  views    integer not null default 0,     -- alle sidevisninger
  visitors integer not null default 0,     -- «første visning i dag»-approksimasjon
  primary key (day, path)
);

comment on table public.page_views is
  'Aggregert trafikk per dag+sti. Ingen persondata (ingen cookies/IP/UA) — kun tellere. Skrives kun av service_role via netlify/functions/track.js. Opprettet 2026-07-15.';
comment on column public.page_views.visitors is
  'Grov unike-besøk-approksimasjon: klientens sessionStorage-flagg «første visning i dag» (per fane/økt). Ikke unike personer.';

-- Rask «trafikk per dag»-summering på tvers av stier.
create index if not exists page_views_day_idx on public.page_views (day);

-- ── RLS: deny-by-default for anon/authenticated ────────────────────────────
-- service_role påvirkes ikke (omgår RLS uansett). Eksplisitt deny-policy i
-- stedet for «RLS uten policy» så intensjonen er tydelig og linteren tier.
alter table public.page_views enable row level security;

drop policy if exists page_views_deny_anon on public.page_views;
create policy page_views_deny_anon on public.page_views
  for all to anon, authenticated using (false) with check (false);

-- ── Atomisk upsert-inkrement ───────────────────────────────────────────────
-- Unngår race-condition (les → +1 → skriv) ved samtidige treff. Kalles KUN
-- fra serverless med service-rolle (netlify/functions/track.js) — derfor
-- trekkes EXECUTE fra alle andre roller under.
-- search_path låses til '' (lint-konvensjon); alt refereres skjemakvalifisert.
create or replace function public.increment_page_view(p_day date, p_path text, p_new_visit boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.page_views (day, path, views, visitors)
  values (p_day, p_path, 1, case when p_new_visit then 1 else 0 end)
  on conflict (day, path) do update
     set views    = public.page_views.views + 1,
         visitors = public.page_views.visitors + case when p_new_visit then 1 else 0 end;
$$;

-- Kun service_role skal kunne kalle den (samme mønster som increment_quiz_plays
-- ETTER lint-runden 19. juni: revoke fra public/anon/authenticated).
revoke execute on function public.increment_page_view(date, text, boolean) from public;
revoke execute on function public.increment_page_view(date, text, boolean) from anon;
revoke execute on function public.increment_page_view(date, text, boolean) from authenticated;
grant  execute on function public.increment_page_view(date, text, boolean) to service_role;

commit;

-- Valgfri opprydding (kjør manuelt ved behov, eller pg_cron senere):
-- delete from public.page_views where day < (current_date - interval '400 days');
