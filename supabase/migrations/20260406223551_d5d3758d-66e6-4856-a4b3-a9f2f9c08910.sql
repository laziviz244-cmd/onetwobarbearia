CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (key, value) VALUES
  ('business_hours', '{"monday": {"open": "08:00", "close": "19:00", "enabled": true}, "tuesday": {"open": "08:00", "close": "19:00", "enabled": true}, "wednesday": {"open": "08:00", "close": "19:00", "enabled": true}, "thursday": {"open": "08:00", "close": "19:00", "enabled": true}, "friday": {"open": "08:00", "close": "19:00", "enabled": true}, "saturday": {"open": "08:00", "close": "17:00", "enabled": true}, "sunday": {"open": "00:00", "close": "00:00", "enabled": false}}'::jsonb),
  ('contact_info', '{"phone": "", "whatsapp": "", "instagram": "", "address": ""}'::jsonb),
  ('banners', '[]'::jsonb);

ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;