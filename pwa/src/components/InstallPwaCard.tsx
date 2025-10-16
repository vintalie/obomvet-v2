import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

export default function InstallPwaCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-yellow-400 text-gray-900 p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]
                       border-2 border-yellow-500 flex items-start gap-4 max-w-sm cursor-pointer
                       hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
            onClick={handleInstall}
          >
            <div className="bg-white p-3 rounded-full shadow-md">
              <Download className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Instale o oBomVet</h2>
              <p className="text-sm opacity-90">
                Adicione à tela inicial para acesso rápido e notificações em tempo real.
              </p>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Efeito de flutuação leve */}
          <motion.div
            className="absolute inset-0 rounded-2xl blur-2xl bg-yellow-400 opacity-40 -z-10"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
