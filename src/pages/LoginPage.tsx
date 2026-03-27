import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const lastUser = localStorage.getItem("last_logged_user") || "";
  const [username, setUsername] = useState(lastUser);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    const stored = localStorage.getItem("onetwo_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.username === username.trim()) {
        navigate("/cliente", { replace: true });
        return;
      }
    }

    // Simple login: save session and update device memory
    const userData = {
      username: username.trim(),
      token: btoa(`${username}:${Date.now()}`),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("onetwo_user", JSON.stringify(userData));
    localStorage.setItem("last_logged_user", username.trim());
    navigate("/cliente", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-5"
      >
        <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tight mb-2">
          Entrar
        </h1>

        <input
          type="text"
          placeholder="Nome de Usuário"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          className="w-full rounded-2xl px-5 py-3.5 font-opensans text-sm outline-none"
          style={{
            background: "#000000",
            border: "1px solid #C5A059",
            color: "#FFFFFF",
          }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          className="w-full rounded-2xl px-5 py-3.5 font-opensans text-sm outline-none"
          style={{
            background: "#000000",
            border: "1px solid #C5A059",
            color: "#FFFFFF",
          }}
        />

        {error && (
          <p className="text-xs font-opensans" style={{ color: "#ff4444" }}>{error}</p>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={handleLogin}
          className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm tracking-tight"
          style={{ background: "#FFFFFF", color: "#000000" }}
        >
          Entrar
        </motion.button>

        <p className="text-xs font-opensans" style={{ color: "hsl(0 0% 100% / 0.5)" }}>
          Não tem conta?{" "}
          <button onClick={() => navigate("/perfil")} className="font-semibold" style={{ color: "#C5A059" }}>
            Criar Perfil
          </button>
        </p>
      </motion.div>
    </div>
  );
}
