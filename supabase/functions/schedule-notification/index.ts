const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!ONESIGNAL_REST_API_KEY) {
      throw new Error("ONESIGNAL_REST_API_KEY not configured");
    }

    const { clientName, serviceName, dateLabel, time, date } = await req.json();

    if (!clientName || !time || !date) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate send_after: 30 minutes before appointment
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00-03:00`);
    const sendAt = new Date(appointmentDate.getTime() - 30 * 60 * 1000);

    // Don't schedule if the reminder time is already in the past
    if (sendAt.getTime() <= Date.now()) {
      return new Response(JSON.stringify({ skipped: true, reason: "Reminder time already passed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      app_id: "0f5b4b37-b119-45c0-bd5e-641d5553970d",
      include_aliases: { external_id: [clientName] },
      target_channel: "push",
      send_after: sendAt.toISOString(),
      headings: { en: "⏰ Lembrete de Agendamento" },
      contents: {
        en: `Seu ${serviceName} é daqui a 30 minutos! (${dateLabel} às ${time}) — Onetwo Barbershop`,
      },
    };

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OneSignal error:", result);
      return new Response(JSON.stringify({ error: "Failed to schedule notification", details: result }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, notification_id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
