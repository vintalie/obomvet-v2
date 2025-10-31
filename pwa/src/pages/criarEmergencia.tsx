// src/pages/ReportInput.tsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Mic,
  Square,
  PawPrint,
  Loader2,
  AlertTriangle,
  Home,
  Building,
} from "lucide-react";
import SuccessModal from "../components/emergency/SuccessModal";
import { useEmergencyReport } from "../hooks"; // <-- Única importação de hook
import { EmergencyForm, URGENCIAS } from "../types/emergency.types";

export default function ReportInput() {
  // ÚNICA LÓGICA MANTIDA AQUI: Gerenciar o Token
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  // CHAMA O HOOK PRINCIPAL
  const {
    // Estados
    formData,
    textInput,
    visitaTipo,
    loading,
    error,
    report,
    clinica,
    lastVisitaTipo,
    showSuccessModal,
    location,
    locationError,
    pets,
    isRecording,
    isTranscribing,
    transcribedText,
    
    // Setters e Handlers
    setFormData,
    setTextInput,
    setVisitaTipo,
    setError,
    startRecording,
    stopRecording,
    analyzeTextWithAI,
    handleSubmit,
    closeModal,
  } = useEmergencyReport(token); // Passa o token para o hook

  // ==== O JSX PERMANECE EXATAMENTE IGUAL AO SEU ====
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF9F5] via-[#D8F3DC] to-[#C3E5D0] flex flex-col font-sans">
      <Navbar />
      <div className="max-w-2xl w-full mx-auto mt-24 sm:mt-28 mb-10 px-4 sm:px-6">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-[#25A18E]/10 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-6">
            <PawPrint className="w-7 h-7 text-[#25A18E]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#004E64]">
              Relato de Emergência
            </h1>
          </div>

          {/* Feedbacks */}
          <div className="space-y-3 mb-4">
            {isRecording && (
              <div className="feedback-box bg-red-50 border-red-200 text-red-600">
                <Mic className="w-4 h-4 animate-pulse" /> Gravando...
              </div>
            )}
            {(isTranscribing || (loading && !isRecording)) && (
              <div className="feedback-box bg-blue-50 border-blue-200 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" /> Processando...
              </div>
            )}
            {locationError && (
              <div className="feedback-box bg-yellow-100 border-yellow-300 text-yellow-800 items-start">
                <AlertTriangle className="icon-feedback" />
                <span>{locationError}</span>
              </div>
            )}
            {error && (
              <div className="feedback-box bg-red-100 border-red-300 text-red-800 items-start">
                <AlertTriangle className="icon-feedback" />
                <span>{error}</span>
              </div>
            )}
            <style>{`.feedback-box{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;padding:0.75rem;border-radius:0.5rem;border-width:1px;}.icon-feedback{width:1.25rem;height:1.25rem;flex-shrink:0;margin-top:0.125rem;}@media (min-width:640px){.icon-feedback{width:1rem;height:1rem;margin-top:0;}}`}</style>
          </div>

          {/* FORMULÁRIO */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-5"
          >
            {/* Seção Pet e Urgência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="petSelect" className="label-form">
                  Pet:
                </label>
                {token ? (
                  <>
                    <select
                      id="petSelect"
                      value={formData.pet_id || ""}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          pet_id: e.target.value,
                          nome_pet: "",
                        }));
                        setError(null);
                      }}
                      className="input-form mb-2"
                    >
                      <option value="">Selecione pet</option>
                      {pets.map((pet: any) => ( // (você pode tipar 'pet' aqui se quiser)
                        <option key={pet.id} value={pet.id}>
                          {pet.nome}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Ou nome (novo pet)"
                      value={formData.nome_pet || ""}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          nome_pet: e.target.value,
                          pet_id: "",
                        }));
                        setError(null);
                      }}
                      className="input-form"
                    />
                  </>
                ) : (
                  <input
                    id="petSelect"
                    type="text"
                    placeholder="Nome do pet"
                    value={formData.nome_pet || ""}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, nome_pet: e.target.value }));
                      setError(null);
                    }}
                    className="input-form"
                  />
                )}
              </div>
              <div>
                <label htmlFor="urgenciaSelect" className="label-form">
                  Urgência:
                </label>
                <select
                  id="urgenciaSelect"
                  value={formData.nivel_urgencia}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      nivel_urgencia: e.target
                        .value as EmergencyForm["nivel_urgencia"],
                    }))
                  }
                  className="input-form"
                >
                  {URGENCIAS.map((urg) => (
                    <option key={urg} value={urg}>
                      {urg.charAt(0).toUpperCase() + urg.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seleção de Tipo de Visita */}
            <div>
              <label className="label-form mb-2">Atendimento:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setVisitaTipo("clinica");
                    setError(null);
                  }}
                  className={`button-visita ${
                    visitaTipo === "clinica"
                      ? "button-visita-active"
                      : "button-visita-inactive"
                  }`}
                >
                  <Building size={18} />
                  Na Clínica
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVisitaTipo("domicilio");
                    setError(null);
                  }}
                  className={`button-visita ${
                    visitaTipo === "domicilio"
                      ? "button-visita-active"
                      : "button-visita-inactive"
                  }`}
                >
                  <Home size={18} />
                  Em Domicílio
                </button>
              </div>
              <style>{`.label-form{display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem;color:#4A5568;}.input-form{width:100%;padding:0.5rem;border:1px solid #CBD5E0;border-radius:0.5rem;outline:none;font-size:0.875rem;transition:ring .1s ease-in-out,border-color .1s ease-in-out;}.input-form:focus{ring:2px;ring-offset:0;ring-color:rgba(37,161,142,.5);border-color:#25A18E;}.button-visita{display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:.75rem;border-radius:.5rem;border-width:2px;transition:all .15s ease-in-out;font-size:.875rem;}@media (min-width:640px){.button-visita{font-size:1rem;}}.button-visita-active{border-color:#25A18E;background-color:#EAF9F5;color:#208B7C;font-weight:600;ring:2px;ring-color:rgba(37,161,142,.3);}.button-visita-inactive{border-color:#D1D5DB;background-color:#fff;color:#4B5563;}.button-visita-inactive:hover{background-color:#F9FAFB;border-color:#9CA3AF;}`}</style>
            </div>

            {/* Descrição dos Sintomas */}
            <div>
              <label htmlFor="descricaoSintomas" className="label-form mb-2">
                Sintomas:
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="button-action bg-[#25A18E] hover:bg-[#208B7C]"
                  >
                    <Mic size={16} /> Gravar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="button-action bg-red-600 hover:bg-red-700"
                  >
                    <Square size={16} /> Parar
                  </button>
                )}
                <button
                  type="button"
                  onClick={analyzeTextWithAI}
                  className="button-action bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading || isTranscribing || !textInput.trim()}
                >
                  {loading && !isRecording ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PawPrint size={16} />
                  )}
                  {loading && !isRecording ? "Analisando..." : "Analisar IA"}
                </button>
                <style>{`.button-action{display:inline-flex;align-items:center;gap:.5rem;color:#fff;padding:.5rem 1rem;border-radius:.5rem;transition:background-color .15s ease-in-out;font-size:.875rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);}`}</style>
              </div>
              {transcribedText && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3 text-sm">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Transcrito:
                  </p>
                  <p className="text-gray-800">{transcribedText}</p>
                </div>
              )}
              <textarea
                id="descricaoSintomas"
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setFormData((p) => ({
                    ...p,
                    descricao_sintomas: e.target.value,
                  }));
                  setError(null);
                }}
                placeholder="Descreva os sintomas..."
                className="input-form h-32 resize-y"
                required
              />
            </div>

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={loading || isTranscribing || isRecording}
              className="w-full mt-4 bg-[#25A18E] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#208B7C] transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25A18E] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                </span>
              ) : (
                "Enviar Relatório"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL DE SUCESSO --- */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeModal}
        clinica={clinica}
        report={report}
        lastVisitaTipo={lastVisitaTipo}
        userLocation={location}
        onSetError={setError}
      />
    </div>
  );
}