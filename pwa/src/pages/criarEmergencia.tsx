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
  ClipboardList,
} from "lucide-react";

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
}

const URGENCIAS = ["baixa", "media", "alta", "critica"] as const;

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
  const [error, setError] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [clinica, setClinica] = useState<Clinica | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ==== CHECAR LOGIN E PEGAR PETS ====
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);

    if (t) {
      fetch("http://localhost:8000/api/pets", {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPets(data);
        })
        .catch((err) => console.error("Erro ao buscar pets:", err));
    }
  }, []);

  // ==== SINCRONIZAR TEXTO TRANSCRITO ====
  useEffect(() => {
    if (transcribedText) {
      setTextInput(transcribedText);
      setFormData((p) => ({ ...p, descricao_sintomas: transcribedText }));
    }
  }, [transcribedText]);

  // ==== ÁUDIO ====
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formDataAudio = new FormData();
        formDataAudio.append("file", audioBlob, "audio.webm");

        try {
          setIsTranscribing(true);
          const res = await fetch("http://localhost:8000/api/ia/transcribe", {
            method: "POST",
            body: formDataAudio,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          const text = await res.text();
          const dataParsed = cleanJson(text);

          if (dataParsed?.text) {
            setTranscribedText(dataParsed.text);
          } else {
            console.warn("Não era JSON válido, usando texto bruto:", text);
            setTranscribedText(text); // fallback
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscribedText("");
      setAiResponse(null);
      setMissingFields([]);
      setError("");
    } catch {
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }

  // ==== FUNÇÃO PARA LIMPAR JSON DA IA ====
  const cleanJson = (text: string) => {
    try {
      return JSON.parse(text.replace(/^\uFEFF/, "").trim());
    } catch {
      const match = text.match(/\{.*\}/s);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {}
      }
      return null;
    }
  };

  // ==== ANALISAR TEXTO COM IA ====
  async function analyzeTextWithAI() {
    if (!textInput.trim()) {
      alert("Digite algo antes de analisar com a IA");
      return;
    }

    setIsTranscribing(true);
    setError("");
    setAiResponse(null);
    setMissingFields([]);

    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/ia/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: textInput.trim() }),
      });

      if (!res.ok) {
        const err = await res.text();
        setError(`Erro da IA: ${err}`);
        return;
      }

      const data = await res.json();
      const aiContent = data?.choices?.[0]?.message?.content || "";
      const parsed: AutofillResponse | null = cleanJson(aiContent);

      if (!parsed) {
        console.warn("Resposta da IA não pôde ser parseada:", aiContent);
        setError("Não foi possível interpretar a resposta da IA.");
        return;
      }

      setAiResponse(parsed);
      setMissingFields(parsed.faltando || []);
      setFormData((prev) => ({ ...prev, ...parsed.preenchidos }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTranscribing(false);
    }
  }

  // ==== ENVIO DO RELATÓRIO ====
  async function handleSubmit() {
    if (!formData.descricao_sintomas.trim()) {
      alert("Por favor, descreva os sintomas");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setClinica(null);

    try {
      let petId: number | null = formData.pet_id ? Number(formData.pet_id) : null;

      if (!petId && formData.nome_pet?.trim()) {
        const resPet = await fetch("http://localhost:8000/api/tutores/1/pets", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome: formData.nome_pet.trim() }),
        });

        if (!resPet.ok) {
          const errText = await resPet.text();
          setError(`Erro ao criar pet: ${errText}`);
          setLoading(false);
          return;
        }

        const dataPet = await resPet.json();
        petId = Number(dataPet.data.id);
        setPets((prev) => [...prev, { id: String(petId), nome: formData.nome_pet!.trim() }]);
      }

      if (!petId && !formData.nome_pet?.trim()) {
        alert("Por favor, selecione ou digite o nome do pet");
        setLoading(false);
        return;
      }

      const nivel_urgencia = formData.nivel_urgencia
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (!URGENCIAS.includes(nivel_urgencia as EmergencyForm["nivel_urgencia"])) {
        alert("Nível de urgência inválido. Use: baixa, media, alta ou critica.");
        setLoading(false);
        return;
      }

      const payload: any = {
        descricao_sintomas: formData.descricao_sintomas.trim(),
        nivel_urgencia,
        pet_id: petId,
      };

      const url = "http://localhost:8000/api/emergencias";
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Erro do servidor: ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setReport("Emergência registrada com sucesso!");
      if (data.clinica) setClinica(data.clinica);

      setFormData({ descricao_sintomas: "", nivel_urgencia: "media" });
      setTextInput("");
      setTranscribedText("");
      setAiResponse(null);
      setMissingFields([]);
      alert("Emergência criada com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  // ==== JSX ====
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF9F5] via-[#D8F3DC] to-[#C3E5D0] flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-28 mb-10 px-6">
        <div className="bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] rounded-2xl border border-[#E0E6E3] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#25A18E]/10 rounded-bl-full" />
          <div className="flex items-center gap-3 mb-6">
            <PawPrint className="w-7 h-7 text-[#25A18E]" />
            <h1 className="text-2xl font-bold text-[#004E64]">Relato de Emergência</h1>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
              <Mic className="w-4 h-4 animate-pulse" /> Gravando...
            </div>
          )}
          {isTranscribing && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Transcrevendo/analisando...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          {report && (
            <div className="flex flex-col gap-1 text-green-600 text-sm mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {report}
              </div>
              {clinica && (
                <div className="text-gray-700 text-xs">
                  Clínica: {clinica.nome_fantasia} - Contato: {clinica.telefone_principal}
                </div>
              )}
            </div>
          )}


          {/* FORMULÁRIO PET */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#004E64]">
                Pet:
              </label>

              {token ? (
                <>
                  <select
                    value={formData.pet_id || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, pet_id: e.target.value, nome_pet: "" }))
                    }
                    className="w-full p-2 border border-[#C9E4D9] rounded-lg focus:ring-2 focus:ring-[#25A18E]/40 outline-none mb-2"
                  >
                    <option value="">Selecione um pet</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ou digite o nome do pet para cadastro rápido"
                    value={formData.nome_pet || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, nome_pet: e.target.value, pet_id: "" }))}
                    className="w-full p-2 border border-[#C9E4D9] rounded-lg focus:ring-2 focus:ring-[#25A18E]/40 outline-none"
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Digite o nome do pet"
                  value={formData.nome_pet || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, nome_pet: e.target.value }))}
                  className="w-full p-2 border border-[#C9E4D9] rounded-lg focus:ring-2 focus:ring-[#25A18E]/40 outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[#004E64]">Nível de Urgência:</label>
              <select
                value={formData.nivel_urgencia}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nivel_urgencia: e.target.value as EmergencyForm["nivel_urgencia"] }))
                }
                className="w-full p-2 border border-[#C9E4D9] rounded-lg focus:ring-2 focus:ring-[#25A18E]/40 outline-none"
              >
                {URGENCIAS.map((urg) => (
                  <option key={urg} value={urg}>
                    {urg.charAt(0).toUpperCase() + urg.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AUDIO + TEXTO */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#004E64]">Descrição dos Sintomas:</label>

            <div className="flex gap-3 mb-3">
              {!isRecording ? (
                <button onClick={startRecording} className="flex items-center gap-2 bg-[#25A18E] text-white px-4 py-2 rounded-lg hover:bg-[#208B7C] transition">
                  <Mic size={18} /> Iniciar
                </button>
              ) : (
                <button onClick={stopRecording} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
                  <Square size={18} /> Parar
                </button>
              )}
            </div>

            {transcribedText && (
              <div className="p-3 bg-[#F8FAFC] rounded-lg border mb-3">
                <p className="text-xs text-gray-500 mb-1">Texto transcrito:</p>
                <p className="text-gray-800 text-sm">{transcribedText}</p>
              </div>
            )}

            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setFormData((p) => ({ ...p, descricao_sintomas: e.target.value }));
              }}
              placeholder="Descreva os sintomas do seu pet..."
              className="w-full p-3 border border-[#C9E4D9] rounded-lg focus:ring-2 focus:ring-[#25A18E]/40 outline-none h-32 resize-none"
            />

            <div className="flex gap-3 mb-3 mt-2">
              <button
                onClick={analyzeTextWithAI}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                disabled={isTranscribing}
              >
                {isTranscribing ? "Analisando..." : "Analisar IA"}
              </button>
            </div>
          </div>

          {/* BOTÃO ENVIAR */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-[#25A18E] text-white py-3 rounded-xl font-semibold hover:bg-[#208B7C] transition shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
              </span>
            ) : (
              "Enviar Relatório"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
