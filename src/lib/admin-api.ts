import { supabase } from "@/integrations/supabase/client";

function getBarberToken(): string | null {
  return localStorage.getItem("barber_admin_session");
}

export async function adminCrud<T = any>(action: string, params: Record<string, any> = {}): Promise<{ data?: T; error?: string }> {
  const token = getBarberToken();
  if (!token) return { error: "Não autenticado" };

  try {
    const { data, error } = await supabase.functions.invoke("admin-crud", {
      body: { action, ...params },
      headers: { "x-barber-token": token },
    });

    if (error) {
      return { error: data?.error || "Erro na operação" };
    }

    return data;
  } catch {
    return { error: "Erro de conexão" };
  }
}
