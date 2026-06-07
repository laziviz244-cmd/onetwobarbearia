import { supabase } from "@/integrations/supabase/client";
import { getCurrentAppointmentUserId } from "@/lib/appointment-user";

async function call<T = any>(action: string, params: Record<string, any> = {}, userId?: string | null): Promise<{ data?: T; error?: string; code?: string }> {
  const uid = userId ?? getCurrentAppointmentUserId() ?? "";
  try {
    const { data, error } = await supabase.functions.invoke("appointments-api", {
      body: { action, ...params },
      headers: uid ? { "x-user-id": uid } : undefined,
    });
    if (error) {
      // supabase.functions.invoke returns the JSON body in `data` on non-2xx
      const message = (data as any)?.error || error.message || "Erro na operação";
      const code = (data as any)?.code;
      return { error: message, code };
    }
    return data as any;
  } catch {
    return { error: "Erro de conexão" };
  }
}

export const appointmentsApi = {
  listReservedTimes: (date: string) =>
    call<never>("list_reserved_times", { date }).then((r) => ({ ...r, times: (r as any)?.times as string[] | undefined })),
  listMine: () => call("list_mine"),
  create: (payload: {
    client_name: string;
    service: string;
    date: string;
    date_label: string;
    time: string;
    status?: string;
    phone?: string | null;
    user_id?: string;
  }) => call<{ id: string; user_id: string }>("create", payload),
  deleteMine: (id: string) => call<{ success: true; notification_id: string | null }>("delete_mine", { id }),
  setNotificationId: (id: string, notification_id: string) =>
    call("set_notification_id", { id, notification_id }),
};
