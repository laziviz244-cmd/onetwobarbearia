
-- Add columns to appointments for admin use
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS amount numeric(10,2);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_method text;

-- Create barber_users table
CREATE TABLE IF NOT EXISTS public.barber_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.barber_users ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  service text NOT NULL,
  amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'dinheiro',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_payments" ON public.payments FOR ALL TO public USING (true) WITH CHECK (true);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_expenses" ON public.expenses FOR ALL TO public USING (true) WITH CHECK (true);

-- Allow updating appointments
CREATE POLICY "Public can update appointments" ON public.appointments FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Insert default barber user with SHA-256 hash of 'admin123'
INSERT INTO public.barber_users (username, password_hash, name)
VALUES ('barbeiro', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Barbeiro')
ON CONFLICT (username) DO NOTHING;
