import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  name: string;
  username: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("barber_admin_session");
    if (stored) {
      try {
        const parsed = JSON.parse(atob(stored));
        if (parsed.exp > Date.now()) {
          setUser({ id: parsed.id, name: parsed.name, username: parsed.username });
        } else {
          localStorage.removeItem("barber_admin_session");
        }
      } catch {
        localStorage.removeItem("barber_admin_session");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("barber-auth", {
        body: { username, password },
      });
      if (error) return { error: "Erro ao conectar ao servidor" };
      if (data?.error) return { error: data.error };

      localStorage.setItem("barber_admin_session", data.token);
      setUser(data.user);
      return {};
    } catch {
      return { error: "Erro de conexão" };
    }
  };

  const logout = () => {
    localStorage.removeItem("barber_admin_session");
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
