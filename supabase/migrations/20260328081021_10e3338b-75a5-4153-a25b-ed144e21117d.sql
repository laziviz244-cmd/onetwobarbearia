DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can read appointments" ON public.appointments;

CREATE POLICY "Public can read identified appointments"
ON public.appointments
FOR SELECT
TO public
USING (user_id <> '');

CREATE POLICY "Public can insert identified appointments"
ON public.appointments
FOR INSERT
TO public
WITH CHECK (user_id <> '');

CREATE POLICY "Public can delete identified appointments"
ON public.appointments
FOR DELETE
TO public
USING (user_id <> '');