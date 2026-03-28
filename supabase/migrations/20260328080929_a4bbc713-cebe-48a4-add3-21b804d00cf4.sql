ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS user_id text;

UPDATE public.appointments
SET user_id = client_name
WHERE user_id IS NULL OR user_id = '';

ALTER TABLE public.appointments
ALTER COLUMN user_id SET DEFAULT '';

ALTER TABLE public.appointments
ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_user_id_created_at
ON public.appointments (user_id, created_at DESC);

ALTER TABLE public.appointments REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
END
$$;