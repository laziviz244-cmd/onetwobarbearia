CREATE POLICY "Public can read app_settings"
ON public.app_settings
FOR SELECT
TO public
USING (true);