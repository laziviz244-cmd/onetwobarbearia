-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  date_label TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmado',
  client_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read appointments
CREATE POLICY "Anyone can read appointments"
  ON public.appointments FOR SELECT
  USING (true);

-- Allow anyone to insert appointments
CREATE POLICY "Anyone can insert appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete appointments
CREATE POLICY "Anyone can delete appointments"
  ON public.appointments FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;