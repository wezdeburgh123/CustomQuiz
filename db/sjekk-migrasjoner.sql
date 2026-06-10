-- CustomQuiz — sjekkliste: hvilke db/migration-*.sql er faktisk kjørt i prod?
-- Kjør HELE blokken i Supabase → SQL Editor. Én rad per migrasjon.
-- status = ✅ betyr at objektet migrasjonen lager finnes i databasen.
-- Bakgrunn: migrasjoner kjøres MANUELT — de kan ligge i repoet uten å være aktive.

with col as (
  -- finnes kolonne i public.<tabell>?
  select table_name, column_name
  from information_schema.columns
  where table_schema = 'public'
),
checks as (
  select 'schema.sql' as migrasjon,
         'tabeller subscribers + payment_events' as sjekker,
         (to_regclass('public.subscribers') is not null
          and to_regclass('public.payment_events') is not null) as ok
  union all select 'migration-quiz-library.sql', 'tabell quiz_library',
         to_regclass('public.quiz_library') is not null
  union all select 'migration-quiz-jobs.sql', 'tabell quiz_jobs',
         to_regclass('public.quiz_jobs') is not null
  union all select 'migration-daily-quiz.sql', 'tabeller daily_quiz + profiles + quiz_attempt',
         (to_regclass('public.daily_quiz') is not null
          and to_regclass('public.profiles') is not null
          and to_regclass('public.quiz_attempt') is not null)
  union all select 'migration-daily-editions.sql', 'daily_quiz.category + quiz_attempt.category',
         (exists (select 1 from col where table_name='daily_quiz'   and column_name='category')
          and exists (select 1 from col where table_name='quiz_attempt' and column_name='category'))
  union all select 'migration-profile-daily-category.sql', 'profiles.daily_category',
         exists (select 1 from col where table_name='profiles' and column_name='daily_category')
  union all select 'migration-profiles-email.sql', 'profiles.email',
         exists (select 1 from col where table_name='profiles' and column_name='email')
  union all select 'migration-marketing-optin.sql', 'profiles.marketing_opt_in',
         exists (select 1 from col where table_name='profiles' and column_name='marketing_opt_in')
  union all select 'migration-quiz-library-free.sql', 'quiz_library.free',
         exists (select 1 from col where table_name='quiz_library' and column_name='free')
  union all select 'migration-quiz-library-team.sql', 'quiz_library.team',
         exists (select 1 from col where table_name='quiz_library' and column_name='team')
  union all select 'migration-quiz-library-moderation.sql', 'quiz_library.review_status',
         exists (select 1 from col where table_name='quiz_library' and column_name='review_status')
  union all select 'migration-quiz-library-plays-rpc.sql', 'funksjon increment_quiz_plays(text)',
         exists (select 1 from pg_proc where proname='increment_quiz_plays')
  union all select 'migration-cancel-flag.sql', 'subscribers.cancel_at_period_end',
         exists (select 1 from col where table_name='subscribers' and column_name='cancel_at_period_end')
  union all select 'migration-vipps-charges.sql', 'subscribers.vipps_next_charge_on',
         exists (select 1 from col where table_name='subscribers' and column_name='vipps_next_charge_on')
  union all select 'migration-vm-events.sql', 'tabeller events + event_quizzes + event_attempts + leagues + league_members',
         (to_regclass('public.events') is not null
          and to_regclass('public.event_quizzes') is not null
          and to_regclass('public.event_attempts') is not null
          and to_regclass('public.leagues') is not null
          and to_regclass('public.league_members') is not null)
  -- migration-league-membership-mgmt.sql = kun kommentar, ingen DDL å verifisere
)
select migrasjon,
       sjekker,
       case when ok then '✅ kjørt' else '❌ MANGLER' end as status
from checks
order by status desc, migrasjon;
