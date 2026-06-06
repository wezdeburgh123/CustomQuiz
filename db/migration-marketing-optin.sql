-- CustomQuiz — myk opt-in for e-post (VM-ligaer + reaktivering).
-- Kjør i Supabase → SQL Editor (én gang). Utvider profiles fra migration-daily-quiz.sql.
--
-- Soft opt-in: når en bruker blir med i / oppretter en VM-liga, informeres de i
-- klartekst om at de av og til får e-post om VM og nye quizer, med avmelding når
-- som helst. Vi lagrer at samtykke ble gitt + når + kilde, så vi har sporbarhet.
-- Selve markedsførings-utsendingen skjer fra Brevo-lista «VM 2026» (Brevo håndterer
-- avmelding/unsubscribe). Service-varsler (runde åpnet, liga) er transaksjonelle og
-- omfattes ikke av dette.

alter table public.profiles
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists opt_in_at         timestamptz,
  add column if not exists opt_in_source     text;

-- (Ingen nye RLS-policyer nødvendig: profiles har allerede lese/skrive-policyer.
--  Opt-in settes server-side med service_role fra league-funksjonene.)
