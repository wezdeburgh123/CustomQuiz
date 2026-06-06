-- CustomQuiz — lagre e-post på profiles for e-postutsending + avmeldings-synk.
-- Kjør i Supabase → SQL Editor (én gang). Utvider profiles.
--
-- E-posten settes server-side (service_role) i recordOptIn ved opt-in, så vi
-- slipper å slå opp auth.users for hver utsending, og Brevo-webhooken kan
-- finne riktig profil ved avmelding (sette marketing_opt_in=false på e-post).

alter table public.profiles
  add column if not exists email text;

create index if not exists profiles_email_idx on public.profiles (lower(email));
