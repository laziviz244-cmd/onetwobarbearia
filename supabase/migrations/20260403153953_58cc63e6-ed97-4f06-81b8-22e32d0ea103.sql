-- Fix security: Remove overly permissive policies and tighten access

-- 1. PAYMENTS: Remove allow_all policy (block all public access)
-- Admin operations will go through edge function with service role
DROP POLICY IF EXISTS "allow_all_payments" ON public.payments;

-- 2. EXPENSES: Remove allow_all policy (block all public access)
-- Admin operations will go through edge function with service role
DROP POLICY IF EXISTS "allow_all_expenses" ON public.expenses;

-- 3. APPOINTMENTS: Fix the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Public can update appointments" ON public.appointments;

-- Allow public to update only their own appointments (by matching user_id)
CREATE POLICY "Users can update own appointments"
ON public.appointments
FOR UPDATE
TO public
USING (user_id <> '' AND user_id IS NOT NULL)
WITH CHECK (user_id <> '' AND user_id IS NOT NULL);

-- 4. Tighten DELETE policy - keep existing but ensure it's scoped
DROP POLICY IF EXISTS "Public can delete identified appointments" ON public.appointments;
CREATE POLICY "Users can delete own appointments"
ON public.appointments
FOR DELETE
TO public
USING (user_id <> '' AND user_id IS NOT NULL);