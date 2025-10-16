import { useState, useEffect } from "react";

export default function InstallPwaCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowCard(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log("User choice:", choice);
    setShowCard(false);
  };

  if (!showCard) return null;

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2 text-yellow-800">Instale o App PWA</h2>
      <p className="mb-4 text-yellow-900">
        Para instalar o aplicativo no Android:
      </p>
      <ol className="list-decimal list-inside text-yellow-900 mb-4">
        <li>Acesse o link do app no navegador (Chrome, Firefox, etc.).</li>
        <li>Clique no ícone de menu no canto superior direito.</li>
        <li>Escolha a opção "Adicionar à tela inicial".</li>
      </ol>
      <button
        onClick={handleInstall}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition font-semibold"
      >
        Instalar App
      </button>
    </div>
  );
}
