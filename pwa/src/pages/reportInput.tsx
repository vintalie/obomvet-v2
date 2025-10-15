import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

interface EmergencyForm {
  pet_id: string;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
}

interface AutofillResponse {
  preenchidos?: Partial<EmergencyForm>;
  faltando?: string[];
}

export default function ReportInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AutofillResponse | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EmergencyForm>({
    pet_id: "",
    descricao_sintomas: "",
    nivel_urgencia: "media",
  });

  const pets = [
    { id: "1", name: "Rex" },
    { id: "2", name: "Mimi" },
    { id: "3", name: "Thor" },
  ];

  useEffect(() => {
    if (transcribedText) {
      setTextInput(transcribedText);
      setFormData((p) => ({ ...p, descricao_sintomas: transcribedText }));
    }
  }, [transcribedText]);

  useEffect(() => setShowInstructions(isRecording), [isRecording]);

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
        setAudioUrl(URL.createObjectURL(audioBlob));

        const formDataAudio = new FormData();
        formDataAudio.append("file", audioBlob, "audio.webm");

        try {
          setIsTranscribing(true);
          setError("");

          const res = await fetch("http://localhost:8000/api/ia/transcribe", {
            method: "POST",
            body: formDataAudio,
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Erro na transcrição");

          const aiContent = data?.choices?.[0]?.message?.content || "";
          let parsed: AutofillResponse | null = null;

          try {
            parsed = JSON.parse(aiContent);
          } catch {
            console.warn("Resposta da IA não pôde ser parseada:", aiContent);
          }

          if (parsed) {
            setAiResponse(parsed);
            setMissingFields(parsed.faltando || []);
            setFormData((prev) => ({ ...prev, ...parsed.preenchidos }));
          }

          setTranscribedText(data.text || "");
          setTextInput(data.text || "");
        } catch (err: any) {
          console.error(err);
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
    } catch (err: any) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }

  async function handleSubmit() {
    const token = localStorage.getItem("token");

    if (!formData.descricao_sintomas.trim()) {
      alert("Por favor, descreva os sintomas");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const payload = {
        ...formData,
        pet_id: formData.pet_id ? parseInt(formData.pet_id) : null,
      };

      const headers = new Headers({ "Content-Type": "application/json" });
      const fetchOptions: RequestInit = {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      };

      const USE_SANCTUM = true;
      if (USE_SANCTUM) {
        fetchOptions.credentials = "include";
        headers.delete("Authorization");
      } else if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const res = await fetch("http://127.0.0.1:8000/api/emergencias", fetchOptions);

      let data: any;
      try {
        data = await res.clone().json();
      } catch {
        const text = await res.text();
        console.error("Resposta do backend não é JSON:", text);
        throw new Error("Erro inesperado do servidor");
      }

      if (!res.ok) throw new Error(data?.message || "Erro ao enviar relatório");

      setReport("Emergência registrada com sucesso!");
      setFormData({ pet_id: "", descricao_sintomas: "", nivel_urgencia: "media" });
      setTextInput("");
      setTranscribedText("");
      setAiResponse(null);
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col">
      <Navbar />

      <div className="p-6 max-w-xl mx-auto mt-32">
        <h1 className="text-2xl font-bold mb-4">Relato de Emergência</h1>

        {isRecording && <p className="text-gray-500 mb-2">🎙 Gravando...</p>}
        {isTranscribing && <p className="text-blue-600 mb-2">Transcrevendo áudio...</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {report && <p className="text-green-600 mb-2">{report}</p>}

        {aiResponse && (
          <div className="p-4 bg-blue-50 border rounded mb-4">
            <h2 className="font-semibold text-blue-800 mb-2">Análise da IA</h2>
            {aiResponse.preenchidos && (
              <p className="text-sm text-gray-700 mb-2">
                Campos identificados automaticamente: {Object.keys(aiResponse.preenchidos).join(", ")}
              </p>
            )}
            {missingFields.length > 0 && (
              <p className="text-sm text-red-600">
                ⚠️ A IA não conseguiu identificar: {missingFields.join(", ")} — complete abaixo.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Selecione o Pet:</label>
            <select
              value={formData.pet_id}
              onChange={(e) => setFormData((p) => ({ ...p, pet_id: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione um pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nível de Urgência:</label>
            <select
              value={formData.nivel_urgencia}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nivel_urgencia: e.target.value as EmergencyForm["nivel_urgencia"] }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descrição dos Sintomas:</label>
          <div className="flex gap-2 mb-3">
            {!isRecording ? (
              <button onClick={startRecording} className="bg-red-600 text-white px-4 py-2 rounded">
                🎤 Iniciar Gravação
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-gray-600 text-white px-4 py-2 rounded">
                ⏹️ Parar
              </button>
            )}
          </div>

          {transcribedText && (
            <div className="p-3 bg-blue-50 rounded mb-3">
              <p className="text-sm text-gray-600 mb-1">Texto transcrito:</p>
              <p className="text-gray-800">{transcribedText}</p>
            </div>
          )}

          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setFormData((p) => ({ ...p, descricao_sintomas: e.target.value }));
            }}
                       placeholder="Descreva os sintomas"
            className="w-full p-3 border rounded mb-2 h-32"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          {loading ? "Enviando..." : "Enviar Relatório"}
        </button>
      </div>
    </div>
  );
}

