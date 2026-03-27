import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useState, useEffect } from "react";

export default function Perfil() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("onetwo_user");
    if (user) {
      const parsed = JSON.parse(user);
      setIsLoggedIn(true);
      setSavedName(parsed.username);
    }
  }, []);

  // Check for duplicate username
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("onetwo_users") || "[]");
    setIsDuplicate(
      users.some(
        (u: any) =>
          u.username?.toLowerCase() === username.trim().toLowerCase()
      ) && username.trim().length > 0
    );
  }, [username]);

  // Session recovery on visibility change / pageshow
  useEffect(() => {
    const revive = () => {
      const s = localStorage.getItem("onetwo_user");
      if (s && isLoggedIn) return;
      if (s) {
        const parsed = JSON.parse(s);
        setIsLoggedIn(true);
        setSavedName(parsed.username);
      }
    };
    const onVisChange = () => { if (!document.hidden) revive(); };
    window.addEventListener("pageshow", revive);
    document.addEventListener("visibilitychange", onVisChange);
    return () => {
      window.removeEventListener("pageshow", revive);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [isLoggedIn]);

  const handleCreateProfile = () => {
    if (!username.trim() || !password.trim() || isDuplicate) return;

    const userData = {
      username: username.trim(),
      token: btoa(`${username}:${Date.now()}`),
      createdAt: new Date().toISOString(),
    };
    // Save session immediately and update device memory
    localStorage.setItem("onetwo_user", JSON.stringify(userData));
    localStorage.setItem("last_logged_user", username.trim());

    // Save to users registry for duplicate checking
    const users = JSON.parse(localStorage.getItem("onetwo_users") || "[]");
    users.push({ username: username.trim() });
    localStorage.setItem("onetwo_users", JSON.stringify(users));

    setIsLoggedIn(true);
    setSavedName(username.trim());
    // Go directly to internal home
    navigate("/cliente", { replace: true });
  };

  const handleLogout = () => {
    // Save last user for device memory before clearing session
    const currentUser = localStorage.getItem("onetwo_user");
    if (currentUser) {
      const parsed = JSON.parse(currentUser);
      localStorage.setItem("last_logged_user", parsed.username);
    }
    // Clear session data but keep last_logged_user
    localStorage.removeItem("onetwo_user");
    localStorage.removeItem("onetwo_appointments");
    localStorage.removeItem("onetwo_loyalty");
    sessionStorage.clear();
    // Reset state
    setIsLoggedIn(false);
    setSavedName("");
    setUsername("");
    setPassword("");
    // Redirect to vitrine
    navigate("/vitrine", { replace: true });
  };

  const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !isDuplicate;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#1A1A1A" }}
          >
            <User className="w-7 h-7" style={{ color: "#C5A059" }} />
          </div>
          <div>
            <h1 className="text-xl font-montserrat font-bold text-foreground">
              {isLoggedIn ? savedName : "Meu Perfil"}
            </h1>
            {isLoggedIn && (
              <p className="text-xs font-montserrat font-semibold" style={{ color: "#C5A059" }}>
                Membro do Clube One Two
              </p>
            )}
          </div>
        </motion.div>
      </header>

      <main className="px-6 space-y-5">
        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div
              className="w-full rounded-2xl p-6 text-center"
              style={{ background: "#1A1A1A", border: "1px solid #C5A059" }}
            >
              <p className="font-montserrat font-bold text-foreground text-lg mb-1">
                Bem-vindo, {savedName}!
              </p>
              <p className="text-sm font-opensans" style={{ color: "hsl(0 0% 100% / 0.6)" }}>
                Sessão ativa · Membro do Clube One Two
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/agendar")}
              className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm"
              style={{ background: "#C5A059", color: "#000000" }}
            >
              Ver Agendamentos e Fidelidade
            </motion.button>

            <button
              onClick={handleLogout}
              className="text-sm font-opensans underline mt-2"
              style={{ color: "hsl(0 0% 100% / 0.6)" }}
            >
              Sair da conta
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <input
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl px-5 py-3.5 font-opensans text-sm text-foreground outline-none"
              style={{
                background: "#1A1A1A",
                border: `1px solid ${isDuplicate ? '#ff4444' : '#C5A059'}`,
                color: "#FFFFFF",
              }}
            />
            {isDuplicate && (
              <p className="text-xs font-opensans w-full text-left -mt-2" style={{ color: "#ff4444" }}>
                Este nome de usuário já está em uso. Tente outro.
              </p>
            )}
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl px-5 py-3.5 font-opensans text-sm text-foreground outline-none"
              style={{
                background: "#1A1A1A",
                border: "1px solid #C5A059",
                color: "#FFFFFF",
              }}
            />
            <motion.button
              whileTap={canSubmit ? { scale: 0.96 } : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={handleCreateProfile}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm tracking-tight transition-opacity"
              style={{
                background: "#FFFFFF",
                color: "#000000",
                opacity: canSubmit ? 1 : 0.4,
              }}
            >
              Criar Perfil
            </motion.button>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
