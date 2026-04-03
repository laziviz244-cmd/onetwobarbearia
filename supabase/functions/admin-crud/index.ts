import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-barber-token',
}

async function verifyBarberToken(supabase: any, token: string): Promise<{ id: string; name: string; username: string } | null> {
  try {
    const decoded = JSON.parse(atob(token))
    if (!decoded.id || !decoded.exp || decoded.exp < Date.now()) return null

    const { data } = await supabase
      .from('barber_users')
      .select('id, name, username')
      .eq('id', decoded.id)
      .single()

    return data || null
  } catch {
    return null
  }
}

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const token = req.headers.get('x-barber-token')
  if (!token) return jsonResponse({ error: 'Token não fornecido' }, 401)

  const barber = await verifyBarberToken(supabase, token)
  if (!barber) return jsonResponse({ error: 'Token inválido ou expirado' }, 401)

  try {
    const { action, ...params } = await req.json()

    switch (action) {
      // --- PAYMENTS ---
      case 'list_payments': {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'add_payment': {
        const { client_name, service, amount, payment_method, date } = params
        if (!client_name || !amount) return jsonResponse({ error: 'Campos obrigatórios faltando' }, 400)
        const { data, error } = await supabase.from('payments').insert({
          client_name, service, amount: parseFloat(amount), payment_method: payment_method || 'pix', date
        }).select().single()
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'delete_payment': {
        const { id } = params
        if (!id) return jsonResponse({ error: 'ID obrigatório' }, 400)
        const { error } = await supabase.from('payments').delete().eq('id', id)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true })
      }

      // --- EXPENSES ---
      case 'list_expenses': {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false })
          .limit(100)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'add_expense': {
        const { description, amount, date } = params
        if (!description || !amount) return jsonResponse({ error: 'Campos obrigatórios faltando' }, 400)
        const { data, error } = await supabase.from('expenses').insert({
          description, amount: parseFloat(amount), date
        }).select().single()
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'delete_expense': {
        const { id } = params
        if (!id) return jsonResponse({ error: 'ID obrigatório' }, 400)
        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true })
      }

      // --- APPOINTMENTS (admin) ---
      case 'list_appointments': {
        const { date } = params
        if (!date) return jsonResponse({ error: 'Data obrigatória' }, 400)
        const { data, error } = await supabase.from('appointments').select('*').eq('date', date).order('time')
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'add_appointment': {
        const { client_name, service, date, date_label, time, status, user_id, phone } = params
        if (!client_name || !date || !time) return jsonResponse({ error: 'Campos obrigatórios faltando' }, 400)
        const { data, error } = await supabase.from('appointments').insert({
          client_name, service, date, date_label, time, status: status || 'Confirmado',
          user_id: user_id || client_name, phone: phone || null
        }).select().single()
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'update_appointment': {
        const { id, client_name, service, time, phone } = params
        if (!id) return jsonResponse({ error: 'ID obrigatório' }, 400)
        const updates: any = {}
        if (client_name !== undefined) updates.client_name = client_name
        if (service !== undefined) updates.service = service
        if (time !== undefined) updates.time = time
        if (phone !== undefined) updates.phone = phone
        const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single()
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }
      case 'delete_appointment': {
        const { id } = params
        if (!id) return jsonResponse({ error: 'ID obrigatório' }, 400)
        const { error } = await supabase.from('appointments').delete().eq('id', id)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true })
      }

      // --- DASHBOARD ---
      case 'dashboard_data': {
        const { date } = params
        const { data: appts } = await supabase.from('appointments').select('*').eq('date', date).order('time')
        const { data: payments } = await supabase.from('payments').select('amount').eq('date', date)
        return jsonResponse({
          appointments: appts || [],
          todayRevenue: (payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0)
        })
      }

      // --- REPORTS ---
      case 'report_daily': {
        const { date } = params
        if (!date) return jsonResponse({ error: 'Data obrigatória' }, 400)
        const [pRes, aRes] = await Promise.all([
          supabase.from('payments').select('*').eq('date', date).order('created_at'),
          supabase.from('appointments').select('*').eq('date', date).order('time'),
        ])
        return jsonResponse({ payments: pRes.data || [], appointments: aRes.data || [] })
      }
      case 'report_monthly': {
        const { start, end } = params
        if (!start || !end) return jsonResponse({ error: 'Período obrigatório' }, 400)
        const [pRes, eRes, aRes] = await Promise.all([
          supabase.from('payments').select('*').gte('date', start).lte('date', end),
          supabase.from('expenses').select('*').gte('date', start).lte('date', end),
          supabase.from('appointments').select('*').gte('date', start).lte('date', end),
        ])
        return jsonResponse({ payments: pRes.data || [], expenses: eRes.data || [], appointments: aRes.data || [] })
      }

      default:
        return jsonResponse({ error: 'Ação desconhecida' }, 400)
    }
  } catch (err) {
    return jsonResponse({ error: 'Erro interno do servidor' }, 500)
  }
})
