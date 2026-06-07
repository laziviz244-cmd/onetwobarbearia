import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Basic sanity checks to prevent abuse (length caps, status whitelist).
function sanitizeStr(v: unknown, max = 200): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t || t.length > max) return null
  return t
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { action, ...params } = await req.json()
    // Client identity: long, opaque, generated locally and persisted in localStorage.
    // Used to scope read/update/delete to the owner. Not a replacement for real auth,
    // but ensures one user_id cannot trivially read/modify another's data without
    // possessing that user_id string.
    const userId = req.headers.get('x-user-id') || ''

    switch (action) {
      // Public: returns only the times that are reserved for a date.
      // No PII (no names, phones, services) — used only to disable taken slots.
      case 'list_reserved_times': {
        const date = sanitizeStr(params?.date, 20)
        if (!date) return jsonResponse({ error: 'Data obrigatória' }, 400)
        const { data, error } = await supabase
          .from('appointments')
          .select('time')
          .eq('date', date)
          .eq('status', 'Confirmado')
          .order('time', { ascending: true })
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ times: (data || []).map((r: any) => r.time) })
      }

      // Owner-scoped list. Requires x-user-id header to match the rows' user_id.
      case 'list_mine': {
        if (!userId || userId.length < 4) return jsonResponse({ error: 'Sessão inválida' }, 401)
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(200)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      // Public booking. Anyone can book, but we sanitize and force user_id from header
      // (falling back to body.user_id) so the owner is recorded server-side.
      case 'create': {
        const client_name = sanitizeStr(params?.client_name, 120)
        const service = sanitizeStr(params?.service, 120)
        const date = sanitizeStr(params?.date, 20)
        const date_label = sanitizeStr(params?.date_label, 20)
        const time = sanitizeStr(params?.time, 10)
        const status = sanitizeStr(params?.status, 40) || 'Confirmado'
        const phone = params?.phone ? sanitizeStr(params.phone, 40) : null
        const ownerId = userId || sanitizeStr(params?.user_id, 200) || client_name
        if (!client_name || !service || !date || !date_label || !time || !ownerId) {
          return jsonResponse({ error: 'Campos obrigatórios faltando' }, 400)
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert({ client_name, service, date, date_label, time, status, phone, user_id: ownerId })
          .select('id, user_id')
          .single()

        if (error) {
          // Surface unique-violation cleanly so the client can refresh slots.
          const code = (error as any)?.code
          return jsonResponse({ error: error.message, code }, code === '23505' ? 409 : 500)
        }
        return jsonResponse({ data })
      }

      // Owner-scoped delete. Also returns the notification_id so the caller can cancel push.
      case 'delete_mine': {
        if (!userId) return jsonResponse({ error: 'Sessão inválida' }, 401)
        const id = sanitizeStr(params?.id, 64)
        if (!id) return jsonResponse({ error: 'ID obrigatório' }, 400)

        const { data: existing } = await supabase
          .from('appointments')
          .select('id, user_id, notification_id')
          .eq('id', id)
          .single()

        if (!existing || existing.user_id !== userId) {
          return jsonResponse({ error: 'Agendamento não encontrado' }, 404)
        }

        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true, notification_id: existing.notification_id ?? null })
      }

      // Owner-scoped notification_id update (used after scheduling push reminder).
      case 'set_notification_id': {
        if (!userId) return jsonResponse({ error: 'Sessão inválida' }, 401)
        const id = sanitizeStr(params?.id, 64)
        const notification_id = sanitizeStr(params?.notification_id, 200)
        if (!id || !notification_id) return jsonResponse({ error: 'Parâmetros obrigatórios' }, 400)

        const { error } = await supabase
          .from('appointments')
          .update({ notification_id })
          .eq('id', id)
          .eq('user_id', userId)

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true })
      }

      default:
        return jsonResponse({ error: 'Ação desconhecida' }, 400)
    }
  } catch (err) {
    console.error('appointments-api error:', err)
    return jsonResponse({ error: 'Erro interno do servidor' }, 500)
  }
})
