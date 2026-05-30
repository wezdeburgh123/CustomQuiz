-- CustomQuiz — Supabase-skjema for innlogging + abonnement
-- Kjør dette i Supabase → SQL Editor (én gang). Bygger på beslutningen
-- "Alt: Stripe + Vipps + login" (30. mai 2026). Selger = privat/eget AS.
--
-- Modell:
--   auth.users        — Supabase Auth (magic link). Identiteten er e-post.
--   subscribers       — én rad per bruker, speiler abonnementsstatus.
--   payment_events    — rå hendelseslogg fra Stripe/Vipps (revisjon/feilsøk).
--
-- Innholdslåsing skjer ved å sjekke subscribers.status = 'active' for
-- innlogget bruker (se netlify/functions/subscription-status.js).

-- ──────────────────────────────────────────────────────────────
-- 1) subscribers
-- ──────────────────────────────────────────────────────────────
create table if not exists public.subscribers (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  email             text not null unique,
  status            text not null default 'none',     -- none | pending | active | past_due | canceled
  source            text,                              -- stripe | vipps
  plan              text default 'premium_monthly',
  -- Stripe
  stripe_customer_id      text,
  stripe_subscription_id  text,
  -- Vipps
  vipps_agreement_id      text,
  -- Periode
  current_period_end      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists subscribers_email_idx on public.subscribers (email);
create index if not exists subscribers_stripe_sub_idx on public.subscribers (stripe_subscription_id);
create index if not exists subscribers_vipps_agr_idx on public.subscribers (vipps_agreement_id);

-- ──────────────────────────────────────────────────────────────
-- 2) payment_events (rå logg)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.payment_events (
  id          bigint generated always as identity primary key,
  source      text not null,            -- stripe | vipps
  event_type  text,
  email       text,
  ref_id      text,                     -- subscription/agreement/session id
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 3) updated_at-trigger
-- ──────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscribers_touch on public.subscribers;
create trigger subscribers_touch
  before update on public.subscribers
  for each row execute function public.touch_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 4) RLS
--    Frontend (anon-nøkkel) får KUN lese sin egen rad.
--    Skriving skjer utelukkende fra serverless med service_role-nøkkel,
--    som omgår RLS — derfor ingen insert/update-policy for anon.
-- ──────────────────────────────────────────────────────────────
alter table public.subscribers   enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "egen abonnementsrad" on public.subscribers;
create policy "egen abonnementsrad"
  on public.subscribers for select
  using (auth.uid() = user_id);

-- payment_events: ingen anon-tilgang i det hele tatt (kun service_role).
