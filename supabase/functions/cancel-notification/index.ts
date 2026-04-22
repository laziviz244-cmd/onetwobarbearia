const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-barber-token',
};

const ONESIGNAL_APP_ID = "0f5b4b37-b119-45c0-bd5e-641d5553970d";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!ONESIGNAL_REST_API_KEY) throw new Error("ONESIGNAL_REST_API_KEY not configured");

    const { notification_id } = await req.json();
    if (!notification_id) {
      return new Response(JSON.stringify({ error: "Missing notification_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://api.onesignal.com/notifications/${notification_id}?app_id=${ONESIGNAL_APP_ID}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Key ${ONESIGNAL_REST_API_KEY}` },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("OneSignal cancel error:", result);
      return new Response(JSON.stringify({ error: "Failed to cancel notification", details: result }), {
        status: 200, // soft-fail: don't block deletion flow
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
