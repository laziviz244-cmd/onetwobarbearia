import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { currentUsername, currentPassword, newUsername, newPassword } = await req.json()

    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      return new Response(JSON.stringify({ error: 'Todos os campos são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (newUsername.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'Novo usuário deve ter pelo menos 3 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (newPassword.trim().length < 4) {
      return new Response(JSON.stringify({ error: 'Nova senha deve ter pelo menos 4 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const currentHash = await sha256(currentPassword)

    const { data: user, error: fetchError } = await supabase
      .from('barber_users')
      .select('id, username, password_hash')
      .eq('username', currentUsername)
      .single()

    if (fetchError || !user || user.password_hash !== currentHash) {
      return new Response(JSON.stringify({ error: 'Usuário ou senha atual inválidos' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const newHash = await sha256(newPassword.trim())

    const { error: updateError } = await supabase
      .from('barber_users')
      .update({ username: newUsername.trim(), password_hash: newHash })
      .eq('id', user.id)

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Erro ao atualizar credenciais' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
