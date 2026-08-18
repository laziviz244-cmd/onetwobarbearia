-- Add barber column
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS barbeiro TEXT DEFAULT 'Geral';

-- Drop old unique constraint if it exists
DROP INDEX IF EXISTS appointments_unique_slot_confirmed;

-- Create new unique constraint including barbeiro
CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_slot_confirmed_per_barber
ON public.appointments (date, time, barbeiro)
WHERE status = 'Confirmado';
