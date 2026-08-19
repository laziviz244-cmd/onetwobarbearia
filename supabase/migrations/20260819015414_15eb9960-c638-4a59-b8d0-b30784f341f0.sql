DELETE FROM public.appointments 
WHERE date = '2026-08-19' 
AND (client_name ILIKE 'Fechado%' OR client_name ILIKE 'Fehcado%')
AND barbeiro = 'Geral';