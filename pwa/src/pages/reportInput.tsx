import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

interface EmergencyForm {
  pet_id: string;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
}

interface IAAssistantResponse {
  tutor?: {
    nome: string;
    telefone: string;
  };
  animal?: {
    nome: string;
    especie: string;
    idade?: string;
    tem_cadastro?: boolean;
  };
  emergencia?: {
    tipo: string;
    urgencia: string;
    acao_recomendada: string;
  };
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
  const [aiResponse, setAiResponse] = useState<IAAssistantResponse | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setShowInstructions(isRecording);
  }, [isRecording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm; codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");

        try {
          setIsTranscribing(true);
          setError("");
          console.log("Enviando áudio para backend (/api/ia/transcribe)...");

          const res = await fetch("http://localhost:8000/api/ia/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("Resposta Whisper/backend:", data);

          if (!res.ok) throw new Error(data.error || "Erro na transcrição");

          // 👉 Extrai o conteúdo JSON da resposta da IA
          const aiContent = data?.choices?.[0]?.message?.content || "";
          const jsonMatch = aiContent.match(/```json([\s\S]*?)```/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1]);
              setAiResponse(parsed);
              console.log("JSON IA parseado:", parsed);
            } catch {
              console.error("Erro ao parsear JSON da IA");
            }
          }

          setTranscribedText(data.text || "");
          setFormData((prev) => ({
            ...prev,
            descricao_sintomas: data.text || "",
          }));

          setTextInput(data.text || "");
        } catch (err: any) {
          console.error("Erro durante transcrição:", err);
          setError(err.message || "Erro na transcrição");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setTranscribedText("");
      setError("");
      setAiResponse(null);
    } catch (err: any) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }

  function useTranscribedText() {
    setTextInput((prev) => {
      const newText = prev + (prev ? " " : "") + transcribedText;
      setFormData((prevForm) => ({
        ...prevForm,
        descricao_sintomas: newText,
      }));
      return newText;
    });
  }

  const [formData, setFormData] = useState<EmergencyForm>({
    pet_id: "",
    descricao_sintomas: "",
    nivel_urgencia: "media",
  });

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    if (!formData.descricao_sintomas.trim()) {
      alert("Por favor, descreva os sintomas (grave áudio ou digite)");
      return;
    }

    if (!formData.pet_id) {
      alert("Por favor, selecione um pet");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const payload = {
        pet_id: parseInt(formData.pet_id),
        descricao_sintomas: formData.descricao_sintomas,
        nivel_urgencia: formData.nivel_urgencia,
      };

      const res = await fetch("http://localhost:8000/api/emergencias", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao enviar relatório");
      }

      setReport("Relatório enviado com sucesso!");
      setFormData({
        pet_id: "",
        descricao_sintomas: "",
        nivel_urgencia: "media",
      });
      setTextInput("");
      setTranscribedText("");
      setAudioUrl(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const pets = [
    { id: "1", name: "Rex" },
    { id: "2", name: "Mimi" },
    { id: "3", name: "Thor" },
  ];

  return (
    <div className="p-6 max-w-xl mx-auto mt-10">
      <BackButton to="/" />
      <h1 className="text-2xl font-bold mb-4">Enviar Relatório de Emergência</h1>

      {showInstructions && <p className="mb-2 text-gray-600 animate-fadeIn">Gravando... fale claramente.</p>}
      {isTranscribing && <p className="mb-2 text-blue-600">Transcrevendo áudio...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {report && <p className="text-green-600 mb-4">{report}</p>}

      {/* 🧠 Exibição da resposta da IA */}
      {aiResponse?.emergencia && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold text-blue-800 mb-2">Análise Automática</h2>
          <p>
            <strong>Tipo:</strong> {aiResponse.emergencia.tipo}
          </p>
          <p>
            <strong>Urgência:</strong>{" "}
            <span
              className={
                aiResponse.emergencia.urgencia === "alta"
                  ? "text-red-600 font-semibold"
                  : "text-yellow-600"
              }
            >
              {aiResponse.emergencia.urgencia.toUpperCase()}
            </span>
          </p>
          <p>
            <strong>Ação Recomendada:</strong> {aiResponse.emergencia.acao_recomendada}
          </p>
        </div>
      )}

      {/* Formulário */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Selecione o Pet:</label>
          <select
            value={formData.pet_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, pet_id: e.target.value }))}
            className="w-full p-2 border rounded"
            required
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
              setFormData((prev) => ({
                ...prev,
                nivel_urgencia: e.target.value as EmergencyForm["nivel_urgencia"],
              }))
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

      {/* Controles de Áudio */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Descrição dos Sintomas:</label>

        <div className="flex gap-2 mb-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              🎤 Iniciar Gravação
            </button>
          ) : (
            <button onClick={stopRecording} className="bg-gray-600 text-white px-4 py-2 rounded">
              ⏹️ Parar Gravação
            </button>
          )}
        </div>

        {transcribedText && (
          <div className="mb-3 p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600 mb-2">Texto transcrito:</p>
            <p className="text-gray-800">{transcribedText}</p>
            <button
              onClick={useTranscribedText}
              className="mt-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded"
            >
              Usar este texto
            </button>
          </div>
        )}

        <textarea
          placeholder="Digite a descrição dos sintomas ou use a gravação"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="w-full p-3 border rounded mb-2 h-32"
        />
        <p className="text-sm text-gray-600">Caracteres: {formData.descricao_sintomas.length}</p>
      </div>

      {audioUrl && (
        <div className="mb-4">
          <audio controls src={audioUrl} className="w-full">
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !formData.descricao_sintomas.trim() || !formData.pet_id}
        className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Enviando..." : "Enviar Relatório de Emergência"}
      </button>
    </div>
  );
}
