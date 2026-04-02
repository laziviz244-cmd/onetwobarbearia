import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "#000000" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-6"
          style={{ background: "#111111" }}
        >
          {/* Shield Icon */}
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(37, 99, 235, 0.15)" }}
          >
            <ShieldCheck className="h-8 w-8" style={{ color: "#2563EB" }} />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h1
              className="font-montserrat font-bold text-2xl tracking-tight"
              style={{ color: "#F9FAFB", letterSpacing: "0.04em" }}
            >
              Painel ONETWO
            </h1>
            <p
              className="text-sm font-opensans mt-1"
              style={{ color: "#9CA3AF" }}
            >
              Acesse sua área administrativa
            </p>
          </div>

          {/* Inputs — no border, dark bg */}
          <div className="w-full flex flex-col gap-4">
            <div>
              <label
                className="block text-xs font-opensans mb-1.5"
                style={{ color: "#9CA3AF" }}
              >
                Usuário
              </label>
              <input
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                className="w-full rounded-xl px-4 py-3.5 text-sm font-opensans outline-none transition-all duration-200"
                style={{
                  background: "#1A1A1A",
                  border: "none",
                  color: "#F9FAFB",
                }}
                autoComplete="username"
              />
            </div>
            <div>
              <label
                className="block text-xs font-opensans mb-1.5"
                style={{ color: "#9CA3AF" }}
              >
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="w-full rounded-xl px-4 py-3.5 text-sm font-opensans outline-none transition-all duration-200"
                style={{
                  background: "#1A1A1A",
                  border: "none",
                  color: "#F9FAFB",
                }}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs font-opensans w-full text-center" style={{ color: "#EF4444" }}>
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-montserrat font-bold text-sm tracking-tight text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110"
            style={{ background: "#2563EB" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs font-opensans transition-colors duration-200"
            style={{ color: "#6B7280" }}
          >
            ← Voltar ao site
          </button>
        </form>
      </motion.div>
    </div>
  );
}
