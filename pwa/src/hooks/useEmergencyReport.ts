// src/hooks/useEmergencyReport.ts
import { useState, useEffect, useCallback } from "react";
import {
  EmergencyForm,
  AutofillResponse,
  Clinica,
  VisitaTipo,
  URGENCIAS,
  Pet,
} from "../types/emergency.types";
import {
  analyzeSymptoms,
  createPet,
  submitEmergency,
} from "../services/apiService";
import { useGeolocation } from "./useGeolocation";
import { usePets } from "./usePets";
import { useAudioRecording } from "./useAudioRecording";

/**
 * Hook para gerenciar toda a lógica da página de Relato de Emergência.
 */
export function useEmergencyReport(token: string | null) {
  // --- Estados do Formulário ---
  const [formData, setFormData] = useState<EmergencyForm>({
    descricao_sintomas: "",
    nivel_urgencia: "media",
  });
  const [textInput, setTextInput] = useState("");
  const [visitaTipo, setVisitaTipo] = useState<VisitaTipo | null>(null);

  // --- Estados de Resposta da API ---
  const [aiResponse, setAiResponse] = useState<AutofillResponse | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [clinica, setClinica] = useState<Clinica | null>(null);

  // --- Estados do Modal ---
  const [lastVisitaTipo, setLastVisitaTipo] = useState<VisitaTipo | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Hooks Aninhados ---
  const { location, locationError } = useGeolocation();
  const { pets, setPets } = usePets(token);
  const {
    isRecording,
    isTranscribing,
    transcribedText,
    setTranscribedText,
    audioError,
    setAudioError,
    startRecording,
    stopRecording,
  } = useAudioRecording(token);

  // --- Efeitos Colaterais ---

  // Sincroniza texto transcrito com o input
  useEffect(() => {
    if (transcribedText && textInput !== transcribedText) {
      console.log("Sincronizando textarea com texto transcrito.");
      setTextInput(transcribedText);
      setFormData((prev) => ({ ...prev, descricao_sintomas: transcribedText }));
    }
  }, [transcribedText, textInput]);

  // Sincroniza erro de áudio com erro principal
  useEffect(() => {
    if (audioError) setError(audioError);
  }, [audioError]);

  // --- Manipuladores de Eventos (Callbacks) ---

  // Analisar Texto com IA
  const analyzeTextWithAI = useCallback(async () => {
    if (!textInput.trim()) {
      setError("Digite/grave sintomas antes.");
      return;
    }
    if (audioError) setAudioError(null);
    setError(null);
    setAiResponse(null);
    setMissingFields([]);
    setLoading(true);
    console.log("Analisando IA:", textInput.trim());

    try {
      const autofillResponse = (await analyzeSymptoms(
        textInput.trim(),
        token
      )) as AutofillResponse;
      console.log("Resposta parseada IA:", autofillResponse);
      setAiResponse(autofillResponse);
      setMissingFields(autofillResponse.faltando || []);

      const updates: Partial<EmergencyForm> = {};
      const preenchidos = autofillResponse.preenchidos || {};
      if (preenchidos.descricao_sintomas)
        updates.descricao_sintomas = preenchidos.descricao_sintomas;
      if (
        preenchidos.nivel_urgencia &&
        URGENCIAS.includes(preenchidos.nivel_urgencia)
      )
        updates.nivel_urgencia = preenchidos.nivel_urgencia;

      const suggestedPetId = String(preenchidos.pet_id || "");
      const suggestedPetName = preenchidos.nome_pet || "";
      if (suggestedPetId && pets.some((p: Pet) => String(p.id) === suggestedPetId)) {
        updates.pet_id = suggestedPetId;
        updates.nome_pet = "";
      } else if (suggestedPetName) {
        updates.nome_pet = suggestedPetName;
        updates.pet_id = "";
      }

      if (Object.keys(updates).length > 0) {
        console.log("Atualizando form IA:", updates);
        setFormData((prev) => ({ ...prev, ...updates }));
        if (updates.descricao_sintomas) setTextInput(updates.descricao_sintomas);
      } else {
        console.log("Nenhuma atualização IA.");
      }
    } catch (err: any) {
      console.error("Erro analisar IA:", err);
      setError(err.message || "Erro conexão IA.");
    } finally {
      setLoading(false);
    }
  }, [textInput, token, audioError, setAudioError, pets]);

  // Enviar Relatório
  const handleSubmit = useCallback(async () => {
    setError(null);
    // Validações
    if (!formData.descricao_sintomas.trim()) { setError("Descreva os sintomas."); return; }
    if (!visitaTipo) { setError("Selecione o tipo de atendimento."); return; }
    if (!formData.pet_id && !formData.nome_pet?.trim()) { setError("Selecione ou digite o pet."); return; }
    if (locationError?.startsWith("Obtendo")) { setError("Aguarde obter localização..."); return; }
    if (visitaTipo === 'domicilio' && !location && !locationError?.includes("negada")) { setError("Localização necessária p/ domicílio."); return; }

    setLoading(true);
    console.log("Iniciando envio...");

    const currentVisitaTipo = visitaTipo;
    setLastVisitaTipo(currentVisitaTipo);

    try {
      let petId: string | null = formData.pet_id || null;
      if (!petId && formData.nome_pet?.trim() && token) {
        console.log("Criando pet:", formData.nome_pet.trim());
        petId = await createPet(formData.nome_pet.trim(), token);
        console.log("Pet criado ID:", petId);
        setPets((prev: Pet[]) => [...prev, { id: petId as string, nome: formData.nome_pet!.trim() }]);
      } else if (formData.pet_id) {
        petId = formData.pet_id;
      } else if (formData.nome_pet?.trim() && !token) {
        throw new Error("Faça login p/ novo pet.");
      }
      if (!petId) throw new Error("ID pet não definido.");

      const nivel_urgencia = formData.nivel_urgencia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const payload: any = {
        descricao_sintomas: formData.descricao_sintomas.trim(),
        nivel_urgencia,
        pet_id: Number(petId),
        visita_tipo: currentVisitaTipo,
        ...(location && {
          location: { latitude: location.latitude, longitude: location.longitude },
        }),
      };

      const data = await submitEmergency(payload, token);
      console.log("Resp. emergência:", data);

      setReport("Emergência registrada!");
      if (data.clinica) {
        const clinicaData = {
          ...data.clinica,
          localizacao:
            typeof data.clinica.localizacao === "string" &&
            data.clinica.localizacao.includes(",")
              ? data.clinica.localizacao
              : undefined,
        };
        setClinica(clinicaData);
      } else {
        setClinica(null);
      }
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Erro handleSubmit:", err);
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
      console.log("Envio finalizado.");
    }
  }, [formData, visitaTipo, location, locationError, token, pets, setPets]);

  // Fechar Modal
  const closeModal = useCallback(() => {
    setShowSuccessModal(false);
    console.log("Fechando modal e limpando formulário...");
    setFormData({
      pet_id: pets.some((p: Pet) => p.id === formData.pet_id)
        ? formData.pet_id
        : undefined,
      descricao_sintomas: "",
      nivel_urgencia: "media",
      nome_pet: "",
    });
    setTextInput("");
    setTranscribedText("");
    setAiResponse(null);
    setMissingFields([]);
    setVisitaTipo(null);
    setLastVisitaTipo(null);
    setReport(null);
    setClinica(null);
    setError(null);
  }, [pets, formData.pet_id, setTranscribedText]);

  // --- Retorno do Hook ---
  // Retorna todos os estados e funções que o JSX precisa
  return {
    // Estados
    formData,
    token,
    textInput,
    visitaTipo,
    aiResponse,
    missingFields,
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
  };
}