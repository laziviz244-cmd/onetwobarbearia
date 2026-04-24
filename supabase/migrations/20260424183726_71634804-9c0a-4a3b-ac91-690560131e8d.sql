CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_slot_confirmed
ON public.appointments (date, time)
WHERE status = 'Confirmado';