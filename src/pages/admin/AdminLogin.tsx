import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import AdminHeadMeta from "@/components/AdminHeadMeta";

const ROYAL_BLUE = "#1a3a8f";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Change credentials state
  const [showChange, setShowChange] = useState(false);
  const [curUser, setCurUser] = useState("");
  const [curPass, setCurPass] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);

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

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curUser.trim() || !curPass.trim() || !newUser.trim() || !newPass.trim()) {
      setChangeError("Preencha todos os campos.");
      return;
    }
    setChangeLoading(true);
    setChangeError("");
    try {
      const { data, error } = await supabase.functions.invoke("barber-change-credentials", {
        body: {
          currentUsername: curUser.trim(),
          currentPassword: curPass.trim(),
          newUsername: newUser.trim(),
          newPassword: newPass.trim(),
        },
      });
      if (error || !data?.success) {
        setChangeError(data?.error || "Erro ao alterar credenciais");
      } else {
        toast.success("Acesso atualizado com sucesso!");
        setCurUser("");
        setCurPass("");
        setNewUser("");
        setNewPass("");
        setShowChange(false);
      }
    } catch {
      setChangeError("Erro de conexão");
    }
    setChangeLoading(false);
  };

  const inputStyle = {
    background: "#1A1A1A",
    border: "none",
    color: "#F9FAFB",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#000000" }}>
      <AdminHeadMeta />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full min-h-screen sm:min-h-0 sm:max-w-md"
      >
        <AnimatePresence mode="wait">
          {!showChange ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="min-h-screen sm:min-h-0 sm:rounded-2xl px-6 sm:px-10 py-16 sm:py-10 flex flex-col items-center justify-center gap-6"
              style={{ background: "#000000" }}
            >
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${ROYAL_BLUE}22` }}
              >
                <Shield className="h-8 w-8" fill={ROYAL_BLUE} style={{ color: ROYAL_BLUE }} />
              </div>

              <div className="text-center">
                <h1
                  className="font-montserrat font-bold text-2xl tracking-tight"
                  style={{ color: "#F9FAFB", letterSpacing: "0.04em" }}
                >
                  Painel ONETWO
                </h1>
                <p className="text-sm font-opensans mt-1" style={{ color: "#9CA3AF" }}>
                  Acesse sua área administrativa
                </p>
              </div>

              <div className="w-full flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-opensans mb-1.5" style={{ color: "#9CA3AF" }}>
                    Usuário
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    className="w-full rounded-xl px-4 py-3.5 text-sm font-opensans outline-none transition-all duration-200"
                    style={inputStyle}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-opensans mb-1.5" style={{ color: "#9CA3AF" }}>
                    Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full rounded-xl px-4 py-3.5 text-sm font-opensans outline-none transition-all duration-200"
                    style={inputStyle}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-opensans w-full text-center" style={{ color: "#EF4444" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-montserrat font-bold text-sm tracking-tight text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110"
                style={{ background: ROYAL_BLUE }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <button
                type="button"
                onClick={() => setShowChange(true)}
                className="flex items-center gap-1.5 text-xs font-opensans transition-colors duration-200"
                style={{ color: "#6B7280" }}
              >
                <KeyRound className="h-3.5 w-3.5" strokeWidth={1.5} />
                Alterar Acesso
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="change"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleChangeCredentials}
              className="min-h-screen sm:min-h-0 sm:rounded-2xl px-6 sm:px-10 py-16 sm:py-10 flex flex-col items-center justify-center gap-5"
              style={{ background: "#000000" }}
            >
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${ROYAL_BLUE}22` }}
              >
                <KeyRound className="h-7 w-7" strokeWidth={1.5} style={{ color: ROYAL_BLUE }} />
              </div>

              <div className="text-center">
                <h1
                  className="font-montserrat font-bold text-xl tracking-tight"
                  style={{ color: "#F9FAFB" }}
                >
                  Alterar Acesso
                </h1>
                <p className="text-xs font-opensans mt-1" style={{ color: "#9CA3AF" }}>
                  Confirme suas credenciais atuais para alterar
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-opensans mb-1" style={{ color: "#9CA3AF" }}>
                    Usuário Atual
                  </label>
                  <input
                    type="text"
                    placeholder="Seu usuário atual"
                    value={curUser}
                    onChange={(e) => { setCurUser(e.target.value); setChangeError(""); }}
                    className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none"
                    style={inputStyle}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-opensans mb-1" style={{ color: "#9CA3AF" }}>
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    placeholder="Sua senha atual"
                    value={curPass}
                    onChange={(e) => { setCurPass(e.target.value); setChangeError(""); }}
                    className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none"
                    style={inputStyle}
                    autoComplete="current-password"
                  />
                </div>

                <div className="w-full h-px my-1" style={{ background: "#1F2937" }} />

                <div>
                  <label className="block text-xs font-opensans mb-1" style={{ color: "#9CA3AF" }}>
                    Novo Usuário
                  </label>
                  <input
                    type="text"
                    placeholder="Escolha o novo usuário"
                    value={newUser}
                    onChange={(e) => { setNewUser(e.target.value); setChangeError(""); }}
                    className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none"
                    style={inputStyle}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-xs font-opensans mb-1" style={{ color: "#9CA3AF" }}>
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Escolha a nova senha"
                    value={newPass}
                    onChange={(e) => { setNewPass(e.target.value); setChangeError(""); }}
                    className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none"
                    style={inputStyle}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {changeError && (
                <p className="text-xs font-opensans w-full text-center" style={{ color: "#EF4444" }}>
                  {changeError}
                </p>
              )}

              <button
                type="submit"
                disabled={changeLoading}
                className="w-full py-3.5 rounded-xl font-montserrat font-bold text-sm tracking-tight text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110"
                style={{ background: ROYAL_BLUE }}
              >
                {changeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {changeLoading ? "Alterando..." : "Confirmar Alteração"}
              </button>

              <button
                type="button"
                onClick={() => { setShowChange(false); setChangeError(""); }}
                className="text-xs font-opensans transition-colors duration-200"
                style={{ color: "#6B7280" }}
              >
                ← Voltar ao login
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
