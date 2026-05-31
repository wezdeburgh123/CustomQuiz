-- Migrasjon: felt for Vipps månedlig trekk (Fase C)
-- ---------------------------------------------------
-- Kjør ÉN gang i Supabase → SQL Editor hvis du allerede har kjørt schema.sql
-- fra før (31. mai 2026). Trygt å kjøre flere ganger (idempotent).
--
-- Legger til to felt på subscribers som trekk-jobben (vipps-charge.js) bruker:
--   vipps_next_charge_on  — forfallsdato for NESTE charge som skal opprettes.
--                           null = ingen charge opprettet ennå (fersk avtale → første trekk).
--   vipps_last_charge_id  — id på sist opprettede charge (statussjekk/feilsøk).

alter table public.subscribers
  add column if not exists vipps_next_charge_on date,
  add column if not exists vipps_last_charge_id text;
