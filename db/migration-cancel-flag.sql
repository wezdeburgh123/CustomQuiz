-- CustomQuiz — migrasjon: legg til cancel_at_period_end på subscribers
-- Kjør i Supabase → SQL Editor (én gang).
--
-- Bakgrunn: Stripe-webhooken fanger nå opp om abonnementet er satt til å
-- avsluttes ved periodeslutt (cancel_at_period_end), så Min side kan vise
-- «Sies opp [dato]» kontra «fornyes [dato]». current_period_end fantes
-- allerede (schema.sql), men ble ikke fylt riktig før — se webhook-fix.

alter table public.subscribers
  add column if not exists cancel_at_period_end boolean not null default false;
