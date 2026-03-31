import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { motion } from "framer-motion";
import { Scissors, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col items-center gap-5"
      >
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: "hsl(40, 50%, 55%)" }}>
          <Scissors className="h-8 w-8 text-black" />
        </div>

        <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tight">
          Painel do Barbeiro
        </h1>
        <p className="text-sm text-muted-foreground font-opensans -mt-3">
          Acesse sua área administrativa
        </p>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          className="w-full rounded-2xl px-5 py-3.5 font-opensans text-sm outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)] focus:border-[hsl(40,50%,55%)] transition-colors"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          className="w-full rounded-2xl px-5 py-3.5 font-opensans text-sm outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)] focus:border-[hsl(40,50%,55%)] transition-colors"
          autoComplete="current-password"
        />

        {error && (
          <p className="text-xs font-opensans text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm tracking-tight text-black disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
          style={{ background: "hsl(40, 50%, 55%)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground font-opensans hover:text-foreground transition-colors"
        >
          ← Voltar ao site
        </button>
      </motion.form>
    </div>
  );
}
