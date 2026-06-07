-- 1) Drop all permissive public policies on appointments.
DROP POLICY IF EXISTS "Public can insert identified appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can read identified appointments"   ON public.appointments;
DROP POLICY IF EXISTS "Users can delete own appointments"          ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments"          ON public.appointments;

-- 2) Revoke direct Data-API access for anon/authenticated on appointments.
--    All reads/writes from the app must now go through the appointments-api
--    edge function (service_role) or admin-crud (service_role).
REVOKE ALL ON public.appointments FROM anon;
REVOKE ALL ON public.appointments FROM authenticated;
GRANT  ALL ON public.appointments TO service_role;

-- 3) Harden barber_users: revoke any inherited grants so password hashes are
--    unreachable via the Data API even if a policy were ever added by mistake.
REVOKE ALL ON public.barber_users FROM anon;
REVOKE ALL ON public.barber_users FROM authenticated;
GRANT  ALL ON public.barber_users TO service_role;

-- 4) expenses + payments already have RLS on with no policies; revoke the
--    Data-API grants too so the implicit deny is reinforced by missing privileges.
REVOKE ALL ON public.expenses FROM anon;
REVOKE ALL ON public.expenses FROM authenticated;
GRANT  ALL ON public.expenses TO service_role;

REVOKE ALL ON public.payments FROM anon;
REVOKE ALL ON public.payments FROM authenticated;
GRANT  ALL ON public.payments TO service_role;

-- 5) Remove appointments from the Realtime publication so anonymous clients
--    cannot subscribe to live customer-data change events.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'appointments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.appointments';
  END IF;
END $$;
