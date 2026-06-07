-- CustomQuiz — fase 2: foretrukket dagens-tema på profilen.
-- Kjør i Supabase → SQL Editor (én gang). ADDITIV og trygg.
--
-- `daily_category` lagrer brukerens faste valg for «dagens»-temautgaver. Når
-- en innlogget bruker åpner dagens.html, forhåndsvelges denne kategorien i
-- stedet for det rullerende ukedagstemaet. NULL = følg ukedagstemaet (default).
-- Settes fra min-side.html eller direkte på dagens («Gjør til mitt faste tema»).

alter table public.profiles
  add column if not exists daily_category text;

-- Ingen ny RLS nødvendig: eksisterende profiles-policies lar brukeren lese og
-- oppdatere SIN egen rad (profiles_read / profiles_update_own).
