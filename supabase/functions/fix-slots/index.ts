import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Fix Quarta-feira (2026-08-19)
const { error: error1 } = await supabase
  .from('appointments')
  .delete()
  .eq('date', '2026-08-19')
  .in('time', ['19:00', '19:30'])

if (error1) console.error("Error fixing Wed:", error1)
else console.log("Wed slots fixed")

// Fix Quinta-feira (2026-08-20) for Black
const { error: error2 } = await supabase
  .from('appointments')
  .delete()
  .eq('date', '2026-08-20')
  .eq('barbeiro', 'Black')

if (error2) console.error("Error fixing Thu:", error2)
else console.log("Thu slots fixed for Black")
