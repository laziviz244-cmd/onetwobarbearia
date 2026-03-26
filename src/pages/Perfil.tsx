import { motion, AnimatePresence } from "framer-motion";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("onetwo_user");
    if (user) {
      const parsed = JSON.parse(user);
      setIsLoggedIn(true);
      setSavedName(parsed.username);
    }
  }, []);

  const handleCreateProfile = () => {
    if (!username.trim() || !password.trim()) return;

    const userData = {
      username: username.trim(),
      token: btoa(`${username}:${Date.now()}`),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("onetwo_user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setSavedName(username.trim());
    setShowSuccessModal(true);
  };

  const handleInstallPWA = () => {
    const deferredPrompt = (window as any).__pwaInstallPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        (window as any).__pwaInstallPrompt = null;
      });
    }
    setShowSuccessModal(false);
    setTimeout(() => navigate("/cliente"), 300);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setTimeout(() => navigate("/cliente"), 300);
  };

  const handleLogout = () => {
    localStorage.removeItem("onetwo_user");
    setIsLoggedIn(false);
    setSavedName("");
    setUsername("");
    setPassword("");
  };

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
                border: "1px solid #C5A059",
                color: "#FFFFFF",
              }}
            />
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
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={handleCreateProfile}
              className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm tracking-tight"
              style={{ background: "#FFFFFF", color: "#000000" }}
            >
              Criar Perfil
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "hsl(0 0% 0% / 0.9)", backdropFilter: "blur(8px)" }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: "#0A0A0A", border: "1px solid #C5A059" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="font-montserrat font-bold text-xl mb-3"
                style={{ color: "#C5A059" }}
              >
                Parabéns! Perfil Criado com Sucesso.
              </h2>
              <p className="text-sm font-opensans mb-6" style={{ color: "#FFFFFF" }}>
                Adicione nosso app à sua tela inicial para agendar com 1 clique. Fique tranquilo: nosso app é ultra leve e NÃO ocupa a memória do seu celular!
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleInstallPWA}
                className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm tracking-tight mb-3"
                style={{ background: "#FFFFFF", color: "#000000" }}
              >
                ADICIONAR À TELA INICIAL
              </motion.button>
              <button
                onClick={handleCloseModal}
                className="text-sm font-opensans"
                style={{ color: "hsl(0 0% 100% / 0.5)" }}
              >
                Agora não
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
