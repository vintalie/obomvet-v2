import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import {
  Mic,
  Square,
  PawPrint,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Home,  
  Building,
} from "lucide-react";

// --- INTERFACES --

interface Location {
  latitude: number;
  longitude: number;
}

interface EmergencyForm {
  pet_id?: string;
  nome_pet?: string;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
}

interface AutofillResponse {
  preenchidos?: Partial<EmergencyForm>;
  faltando?: string[];
}

interface Clinica {
  id: number;
  nome_fantasia: string;
  telefone_principal: string;
  endereco?: string;
  localizacao?: string; // Esperado como "latitude,longitude" vindo do backend
}

type VisitaTipo = "clinica" | "domicilio";

const URGENCIAS = ["baixa", "media", "alta", "critica"] as const;

<Navbar />


export default function ReportInput() {
  const navigate = useNavigate();
    

  const [formData, setFormData] = useState<EmergencyForm>({
    descricao_sintomas: "",
    nivel_urgencia: "media",
  });

  const [pets, setPets] = useState<{ id: string; nome: string }[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AutofillResponse | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Permitir null
  const [report, setReport] = useState<string | null>(null);
  const [clinica, setClinica] = useState<Clinica | null>(null);

  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // *** Mantém o tipo de visita usado no último envio ***
  const [lastVisitaTipo, setLastVisitaTipo] = useState<VisitaTipo | null>(null);
  const [visitaTipo, setVisitaTipo] = useState<VisitaTipo | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ==== CHECAR LOGIN, PEGAR PETS E LOCALIZAÇÃO ====
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);

    if (t) {
      fetch("http://localhost:8000/api/pets", {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Falha ao buscar pets (${res.status})`);
          return res.json();
        })
        .then((data) => {
          console.log("Pets recebidos:", data);
          if (Array.isArray(data)) {
            const formattedPets = data.map(pet => ({ ...pet, id: String(pet.id) }));
            setPets(formattedPets);
          } else {
            console.warn("Resposta da API de pets não é um array:", data);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar pets:", err);
        });
    } else {
      console.log("Nenhum token encontrado, não buscará pets.");
    }

    // Pega a localização
    if (navigator.geolocation) {
      setLocationError("Obtendo sua localização..."); // Mensagem mais curta
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Localização obtida:", position.coords);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          console.warn("Erro ao obter geolocalização:", err.code, err.message);
          let errorMsg = "Não foi possível obter sua localização.";
          if (err.code === 1) errorMsg = "Permissão de localização negada.";
          else if (err.code === 2) errorMsg = "Sua localização não está disponível.";
          else if (err.code === 3) errorMsg = "Tempo esgotado ao obter localização.";
          setLocationError(errorMsg);
        },
        { timeout: 15000, enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocalização não suportada.");
    }
  }, []);

  // ==== SINCRONIZAR TEXTO TRANSCRITO ====
  useEffect(() => {
    if (transcribedText && textInput !== transcribedText) {
      console.log("Sincronizando textarea com texto transcrito.");
      setTextInput(transcribedText);
      setFormData(prev => ({ ...prev, descricao_sintomas: transcribedText }));
    }
  }, [transcribedText, textInput]);

 // ==== FUNÇÕES DE ÁUDIO (sem mudanças lógicas, apenas logs e limpeza) ====
  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const options = { mimeType: 'audio/webm;codecs=opus' };
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn("Webm/opus não suportado, fallback:", e);
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        // --- Início do Bloco onstop ---
        const recorder = mediaRecorderRef.current; // Pega referência atual
        const mimeType = recorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const currentChunks = [...audioChunksRef.current]; // Copia chunks antes de limpar
        audioChunksRef.current = []; // Limpa imediatamente para próxima gravação

        console.log(`Áudio gravado: ${mimeType}, Tamanho: ${audioBlob.size} bytes`);
        if (audioBlob.size === 0) {
          setError("Gravação vazia. Verifique microfone.");
          setIsTranscribing(false);
          // Libera stream se stop foi chamado por erro e não pelo botão
          if (streamRef.current) {
             streamRef.current.getTracks().forEach(track => track.stop());
             streamRef.current = null;
          }
          setIsRecording(false); // Garante que parou
          return;
        }
        const formDataAudio = new FormData();
        const filename = `audio.${mimeType.split('/')[1].split(';')[0]}`;
        formDataAudio.append("file", audioBlob, filename);

        try {
          setIsTranscribing(true);
          setError(null);
          console.log("Enviando áudio para transcrição...");
          const res = await fetch("http://localhost:8000/api/ia/transcribe", { /*...*/
            method: "POST",
            body: formDataAudio,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) { /*...*/
            const errorText = await res.text();
            throw new Error(`Falha na transcrição (${res.status}): ${errorText || res.statusText}`);
          }
          const text = await res.text();
          console.log("Texto recebido da transcrição:", text);
          const dataParsed = cleanJson(text);
          if (dataParsed && typeof dataParsed.text === 'string') {
            console.log("Transcrição ok:", dataParsed.text);
            setTranscribedText(dataParsed.text);
          } else { /*...*/
            console.warn("JSON inválido/sem 'text':", dataParsed);
            if (typeof text === 'string' && text.trim().length > 0) {
                 console.log("Usando texto bruto.");
                 setTranscribedText(text);
            } else {
                 setError("Não foi possível processar texto transcrito.");
            }
          }
        } catch (err: any) { /*...*/
          console.error("Erro onstop/transcrição:", err);
          setError(err.message || "Erro ao processar áudio.");
        } finally {
          setIsTranscribing(false);
          // Libera stream ao final do processamento (mesmo com erro)
           if (streamRef.current) {
             streamRef.current.getTracks().forEach(track => track.stop());
             streamRef.current = null;
             console.log("Tracks de mídia paradas no final do onstop.");
           }
          setIsRecording(false); // Garante que parou após processar
          console.log("Processo onstop finalizado.");
        }
        // --- Fim do Bloco onstop ---
      };
      mediaRecorder.onerror = (event: Event & { error?: DOMException }) => { /*...*/
        console.error("Erro no MediaRecorder:", event.error);
        setError(`Erro gravação: ${event.error?.name || 'desconhecido'}`);
        stopRecording(); // Chama stopRecording para limpar tudo
      };
      mediaRecorder.start();
      console.log("Gravação iniciada...");
      setIsRecording(true);
      setTranscribedText("");
      setTextInput("");
      setFormData(prev => ({...prev, descricao_sintomas: ""}));
      setAiResponse(null);
      setMissingFields([]);
    } catch (err: any) { /*...*/
      console.error("Erro ao iniciar gravação (getUserMedia):", err);
      let errorMessage = "Não foi possível acessar microfone.";
      if (err.name === 'NotAllowedError') errorMessage = "Permissão negada.";
      else if (err.name === 'NotFoundError') errorMessage = "Nenhum microfone encontrado.";
      else if (err.name === 'NotReadableError') errorMessage = "Microfone em uso.";
      else if (err.name === 'SecurityError') errorMessage = "Acesso bloqueado (use HTTPS).";
      else if (err.name === 'AbortError') errorMessage = "Pedido cancelado.";
      setError(errorMessage);
    }
  }


  function stopRecording() {
    console.log("Tentando parar gravação...");
    // Verifica se existe e está gravando
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop(); // O onstop será chamado
      console.log("mediaRecorder.stop() chamado.");
    } else {
      console.log("MediaRecorder não estava gravando/não existe.");
      // Limpa manualmente se não estava gravando
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log("Tracks paradas manualmente.");
      }
      // Garante que estados sejam resetados mesmo sem onstop
      setIsRecording(false);
      setIsTranscribing(false); // Reseta transcrição também
    }
     // Não reseta isRecording aqui, onstop faz isso
  }


  const cleanJson = (text: string): object | null => { /*...*/
    const cleanedText = text.replace(/^```json\s*|```$/gs, '').trim();
    try {
      const parsed = JSON.parse(cleanedText);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
      console.warn("JSON parseado não é um objeto:", parsed); return null;
    } catch (e) {
      console.warn("Falha inicial ao parsear JSON:", e);
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match && match[0]) {
        try {
          const parsedMatch = JSON.parse(match[0]);
          if (typeof parsedMatch === 'object' && parsedMatch !== null) return parsedMatch;
          console.warn("JSON da string não é objeto:", parsedMatch); return null;
        } catch (e2) {
          console.error("Falha ao parsear JSON da string:", e2); return null;
        }
      }
      console.error("Nenhum JSON encontrado:", cleanedText); return null;
    }
  };


  // ==== ANALISAR TEXTO COM IA ====
  async function analyzeTextWithAI() { /*...*/
    if (!textInput.trim()) { setError("Digite/grave sintomas antes."); return; }
    setIsTranscribing(true); setError(null); setAiResponse(null); setMissingFields([]);
    console.log("Analisando IA:", textInput.trim());
    try {
      const headers: HeadersInit = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
      const res = await fetch("http://localhost:8000/api/ia/analyze", { method: "POST", headers, body: JSON.stringify({ text: textInput.trim() }) });
      if (!res.ok) { /*...*/
        const errText = await res.text();
        throw new Error(`Erro API análise (${res.status}): ${errText || res.statusText}`);
      }
      const data = await res.json(); console.log("Resposta bruta IA:", data);
      const aiContent = data?.choices?.[0]?.message?.content || data?.content || data;
      const parsed = typeof aiContent === 'string' ? cleanJson(aiContent) : (typeof aiContent === 'object' ? aiContent : null);
      if (!parsed || typeof parsed !== 'object' || (!('preenchidos' in parsed) && !('faltando' in parsed))) { /*...*/
        console.error("Resposta IA não é AutofillResponse:", parsed);
        throw new Error("Formato inesperado da resposta IA.");
      }
      const autofillResponse = parsed as AutofillResponse;
      console.log("Resposta parseada IA:", autofillResponse);
      setAiResponse(autofillResponse); setMissingFields(autofillResponse.faltando || []);
      const updates: Partial<EmergencyForm> = {}; const preenchidos = autofillResponse.preenchidos || {};
      if (preenchidos.descricao_sintomas) updates.descricao_sintomas = preenchidos.descricao_sintomas;
      if (preenchidos.nivel_urgencia && URGENCIAS.includes(preenchidos.nivel_urgencia)) updates.nivel_urgencia = preenchidos.nivel_urgencia;
      const suggestedPetId = String(preenchidos.pet_id || ''); const suggestedPetName = preenchidos.nome_pet || '';
      if (suggestedPetId && pets.some(p => String(p.id) === suggestedPetId)) { updates.pet_id = suggestedPetId; updates.nome_pet = ''; }
      else if (suggestedPetName) { updates.nome_pet = suggestedPetName; updates.pet_id = ''; }
      if (Object.keys(updates).length > 0) { console.log("Atualizando form IA:", updates); setFormData((prev) => ({ ...prev, ...updates })); }
      else { console.log("Nenhuma atualização IA."); }
    } catch (err: any) { /*...*/
      console.error("Erro analisar IA:", err); setError(err.message || "Erro conexão IA.");
    } finally { setIsTranscribing(false); }
  }

  // ==== ENVIO DO RELATÓRIO ====
  async function handleSubmit() {
    setError(null);
    // Não limpa report/clinica aqui para o modal usar
    // setReport(null);
    // setClinica(null);

    // Validações
    if (!formData.descricao_sintomas.trim()) { setError("Descreva os sintomas."); return; }
    if (!visitaTipo) { setError("Selecione o tipo de atendimento."); return; }
    if (!formData.pet_id && !formData.nome_pet?.trim()) { setError("Selecione ou digite o pet."); return; }
    if (locationError?.startsWith("Obtendo")) { setError("Aguarde obter localização..."); return; }
    if (visitaTipo === 'domicilio' && !location && !locationError?.includes("negada")) { setError("Localização necessária p/ domicílio."); return; }

    setLoading(true);
    console.log("Iniciando envio...");

    // *** Guarda o tipo de visita selecionado ANTES de limpar ***
    const currentVisitaTipo = visitaTipo;
    setLastVisitaTipo(currentVisitaTipo); // Salva para usar no modal

    try {
      let petId: string | null = formData.pet_id || null;
      let createdPet = false;

      if (!petId && formData.nome_pet?.trim() && token) { /* ... criação de pet ... */
        console.log("Criando pet:", formData.nome_pet.trim());
        const createPetUrl = "http://localhost:8000/api/pets";
        const createPetPayload = { nome: formData.nome_pet.trim() };
        const resPet = await fetch(createPetUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(createPetPayload) });
        if (!resPet.ok) { const errText = await resPet.text(); throw new Error(`Erro criar pet (${resPet.status}): ${errText}`); }
        const dataPet = await resPet.json(); console.log("Resp. criar pet:", dataPet);
        const newPetId = dataPet?.data?.id || dataPet?.id || dataPet?.pet?.id;
        if (!newPetId) throw new Error("ID novo pet não encontrado.");
        petId = String(newPetId); createdPet = true; console.log("Pet criado ID:", petId);
        setPets((prev) => [...prev, { id: petId as string, nome: formData.nome_pet!.trim() }]);
      } else if (formData.pet_id) { petId = formData.pet_id;
      } else if (formData.nome_pet?.trim() && !token) { throw new Error("Faça login p/ novo pet."); }
      if (!petId) throw new Error("ID pet não definido.");

      const nivel_urgencia = formData.nivel_urgencia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const payload: any = {
        descricao_sintomas: formData.descricao_sintomas.trim(),
        nivel_urgencia,
        pet_id: Number(petId),
        visita_tipo: currentVisitaTipo, // *** Usa a variável guardada ***
        ...(location && { location: { latitude: location.latitude, longitude: location.longitude } }),
      };
      console.log("Payload:", payload);

      const url = "http://localhost:8000/api/emergencias";
      const headers: HeadersInit = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });

      if (!res.ok) { /* ... tratamento erro ... */
        const text = await res.text(); console.error(`Erro ${res.status}:`, text);
        if (res.status === 422) { /*...*/ throw new Error(Object.values(JSON.parse(text).errors || {}).flat()[0] as string || "Erro dados."); }
        else if (res.status === 401 || res.status === 403) { throw new Error("Não autorizado."); }
        else { throw new Error(`Erro servidor (${res.status}).`); }
      }

      const data = await res.json(); console.log("Resp. emergência:", data);

      setReport("Emergência registrada!"); // Mensagem mais curta
      if (data.clinica) { /* ... formata clinica ... */
        console.log("Clínica recebida:", data.clinica);
        const clinicaData = { ...data.clinica, localizacao: (typeof data.clinica.localizacao === 'string' && data.clinica.localizacao.includes(',')) ? data.clinica.localizacao : undefined };
        console.log("Clínica formatada:", clinicaData); setClinica(clinicaData);
      } else { console.warn("Nenhuma clínica retornada."); setClinica(null); }

      setShowSuccessModal(true); // Abre modal APÓS setar clinica e report

      // *** LÓGICA DE LIMPEZA MOVIDA PARA closeModal ***

    } catch (err: any) {
      console.error("Erro handleSubmit:", err);
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
      console.log("Envio finalizado.");
    }
  }

  // --- FUNÇÕES DO MODAL ---
  function closeModal() {
    setShowSuccessModal(false);
    console.log("Fechando modal e limpando formulário...");
    // *** LIMPEZA DO FORMULÁRIO AGORA AQUI ***
    setFormData({
      // Mantém pet_id se foi selecionado (não criado)
      pet_id: pets.some(p => p.id === formData.pet_id) ? formData.pet_id : undefined,
      descricao_sintomas: "",
      nivel_urgencia: "media",
      nome_pet: "",
    });
    setTextInput("");
    setTranscribedText("");
    setAiResponse(null);
    setMissingFields([]);
    setVisitaTipo(null);
    setLastVisitaTipo(null); // Limpa o tipo de visita guardado
    setReport(null); // Limpa mensagem de sucesso
    setClinica(null); // Limpa dados da clínica
    setError(null); // Limpa erros também
  }

  function handleAbrirRota() { /* ... (sem mudanças, já estava ok) ... */
    setError(null);
    console.log("Abrir rota:", { clinica, location });
    if (!clinica?.localizacao) { setError("Localização clínica indisponível."); return; }
    if (!location) { setError("Sua localização indisponível."); return; }
    const coords = clinica.localizacao.split(',');
    if (coords.length !== 2 || isNaN(parseFloat(coords[0])) || isNaN(parseFloat(coords[1]))) { setError("Formato localização inválido."); return; }
    const [clinicLat, clinicLng] = coords;
    const origin = `${location.latitude},${location.longitude}`;
    const destination = `${clinicLat},${clinicLng}`;
    console.log(`Maps: O=${origin}, D=${destination}`);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  }
  // ------------------------------

  // ==== JSX ====
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF9F5] via-[#D8F3DC] to-[#C3E5D0] flex flex-col font-sans">
      <Navbar />
      <div className="max-w-2xl w-full mx-auto mt-24 sm:mt-28 mb-10 px-4 sm:px-6">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-[#25A18E]/10 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-6">
            <PawPrint className="w-7 h-7 text-[#25A18E]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#004E64]">Relato de Emergência</h1>
          </div>

          {/* Feedbacks */}
          <div className="space-y-3 mb-4">
            {isRecording && ( <div className="feedback-box bg-red-50 border-red-200 text-red-600"><Mic className="w-4 h-4 animate-pulse" /> Gravando...</div> )}
            {isTranscribing && ( <div className="feedback-box bg-blue-50 border-blue-200 text-blue-600"><Loader2 className="w-4 h-4 animate-spin" /> Processando...</div> )}
            {locationError && ( <div className="feedback-box bg-yellow-100 border-yellow-300 text-yellow-800 items-start"><AlertTriangle className="icon-feedback" /><span>{locationError}</span></div> )}
            {error && ( <div className="feedback-box bg-red-100 border-red-300 text-red-800 items-start"><AlertTriangle className="icon-feedback" /><span>{error}</span></div> )}
          <style>{`.feedback-box{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;padding:0.75rem;border-radius:0.5rem;border-width:1px;}.icon-feedback{width:1.25rem;height:1.25rem;flex-shrink:0;margin-top:0.125rem;}@media (min-width:640px){.icon-feedback{width:1rem;height:1rem;margin-top:0;}}`}</style>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">

            {/* Seção Pet e Urgência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="petSelect" className="label-form">Pet:</label>
                {token ? (
                  <>
                    <select id="petSelect" value={formData.pet_id || ""} onChange={(e) => { setFormData((p) => ({ ...p, pet_id: e.target.value, nome_pet: "" })); setError(null); }} className="input-form mb-2">
                      <option value="">Selecione pet</option>
                      {pets.map((pet) => ( <option key={pet.id} value={pet.id}>{pet.nome}</option> ))}
                    </select>
                    <input type="text" placeholder="Ou nome (novo pet)" value={formData.nome_pet || ""} onChange={(e) => { setFormData((p) => ({ ...p, nome_pet: e.target.value, pet_id: "" })); setError(null); }} className="input-form" />
                  </>
                ) : (
                  <input id="petSelect" type="text" placeholder="Nome do pet" value={formData.nome_pet || ""} onChange={(e) => { setFormData((p) => ({ ...p, nome_pet: e.target.value })); setError(null); }} className="input-form" />
                )}
              </div>
              <div>
                <label htmlFor="urgenciaSelect" className="label-form">Urgência:</label>
                <select id="urgenciaSelect" value={formData.nivel_urgencia} onChange={(e) => setFormData((p) => ({ ...p, nivel_urgencia: e.target.value as EmergencyForm["nivel_urgencia"] }))} className="input-form">
                  {URGENCIAS.map((urg) => ( <option key={urg} value={urg}>{urg.charAt(0).toUpperCase() + urg.slice(1)}</option> ))}
                </select>
              </div>
            </div>

            {/* Seleção de Tipo de Visita */}
            <div>
              <label className="label-form mb-2">Atendimento:</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => { setVisitaTipo("clinica"); setError(null); }} className={`button-visita ${visitaTipo === "clinica" ? "button-visita-active" : "button-visita-inactive"}`}><Building size={18} />Na Clínica</button>
                <button type="button" onClick={() => { setVisitaTipo("domicilio"); setError(null); }} className={`button-visita ${visitaTipo === "domicilio" ? "button-visita-active" : "button-visita-inactive"}`}><Home size={18} />Em Domicílio</button>
              </div>
            <style>{`.label-form{display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.25rem;color:#4A5568;}.input-form{width:100%;padding:0.5rem;border:1px solid #CBD5E0;border-radius:0.5rem;outline:none;font-size:0.875rem;transition:ring .1s ease-in-out,border-color .1s ease-in-out;}.input-form:focus{ring:2px;ring-offset:0;ring-color:rgba(37,161,142,.5);border-color:#25A18E;}.button-visita{display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:.75rem;border-radius:.5rem;border-width:2px;transition:all .15s ease-in-out;font-size:.875rem;}@media (min-width:640px){.button-visita{font-size:1rem;}}.button-visita-active{border-color:#25A18E;background-color:#EAF9F5;color:#208B7C;font-weight:600;ring:2px;ring-color:rgba(37,161,142,.3);}.button-visita-inactive{border-color:#D1D5DB;background-color:#fff;color:#4B5563;}.button-visita-inactive:hover{background-color:#F9FAFB;border-color:#9CA3AF;}`}</style>
            </div>

            {/* Descrição dos Sintomas */}
            <div>
              <label htmlFor="descricaoSintomas" className="label-form mb-2">Sintomas:</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {!isRecording ? ( <button type="button" onClick={startRecording} className="button-action bg-[#25A18E] hover:bg-[#208B7C]"><Mic size={16} /> Gravar</button> )
                 : ( <button type="button" onClick={stopRecording} className="button-action bg-red-600 hover:bg-red-700"><Square size={16} /> Parar</button> )}
                <button type="button" onClick={analyzeTextWithAI} className="button-action bg-blue-600 hover:bg-blue-700 disabled:opacity-50" disabled={isTranscribing || !textInput.trim()}>
                  {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PawPrint size={16} />} {isTranscribing ? "Analisando..." : "Analisar IA"}
                </button>
             <style>{`.button-action{display:inline-flex;align-items:center;gap:.5rem;color:#fff;padding:.5rem 1rem;border-radius:.5rem;transition:background-color .15s ease-in-out;font-size:.875rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);}`}</style>
              </div>
              {transcribedText && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3 text-sm">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Transcrito:</p>
                  <p className="text-gray-800">{transcribedText}</p>
                </div>
              )}
              <textarea id="descricaoSintomas" value={textInput} onChange={(e) => { setTextInput(e.target.value); setFormData((p) => ({ ...p, descricao_sintomas: e.target.value })); setError(null); }} placeholder="Descreva os sintomas..." className="input-form h-32 resize-y" required />
            </div>

            {/* Botão Enviar */}
            <button type="submit" disabled={loading || isTranscribing || isRecording} className="w-full mt-4 bg-[#25A18E] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#208B7C] transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25A18E] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? ( <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</span> ) : ( "Enviar Relatório" )}
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL DE SUCESSO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300" onClick={closeModal} >
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl animate-in fade-in-0 zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} >
            {/* Log dentro do Modal */}
            {console.log("Renderizando Modal:", { lastVisitaTipo, clinica, location })} {/* *** USA lastVisitaTipo *** */}
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Clínica Notificada!</h2>
            </div>

            {clinica ? (
              <>
                <p className="text-gray-600 mb-5 text-sm sm:text-base">
                  {lastVisitaTipo === "clinica"
                    ? `Emergência enviada para ${clinica.nome_fantasia}. Dirija-se ao local.`
                    : `Emergência enviada para ${clinica.nome_fantasia}. Aguarde contacto.`}
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200 text-sm">
                  <h3 className="font-semibold text-base text-[#004E64]">{clinica.nome_fantasia}</h3>
                  {clinica.endereco && ( <p className="text-gray-700 mt-1">{clinica.endereco}</p> )}
                  <p className="text-gray-700 mt-1">Telefone: {clinica.telefone_principal || "N/A"}</p>
    {console.log("Clinica.localizacao no modal:", clinica.localizacao)}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* *** CONDIÇÃO USA lastVisitaTipo *** */}
                  {lastVisitaTipo === 'clinica' && typeof clinica.localizacao === 'string' && clinica.localizacao.includes(',') && location && (
                    <button onClick={handleAbrirRota} className="button-modal bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                      <MapPin size={16} /> Abrir Rota
                    </button>
                  )}
                    {/* *** CONDIÇÃO DO BOTÃO FECHAR USA lastVisitaTipo *** */}
                  <button onClick={closeModal} className={`button-modal bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 ${!(lastVisitaTipo === 'clinica' && clinica.localizacao && location) ? 'w-full' : ''}`} >
                    Fechar
                  </button>
                  <style>{`.button-modal{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;color:#fff;padding:.625rem 1rem;border-radius:.5rem;font-weight:600;transition:background-color .15s ease-in-out;font-size:.875rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);focus:outline-none;focus:ring-2;focus:ring-offset-2;}`}</style>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-5 text-sm sm:text-base">{report || "Emergência registrada."}</p>
                <button onClick={closeModal} className="button-modal w-full bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400" >Fechar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

