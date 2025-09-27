import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface EmergencyForm {
  pet_id: string;
  descricao_sintomas: string;
  nivel_urgencia: "baixa" | "media" | "alta" | "critica";
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
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null); // Referência para o stream
  const navigate = useNavigate();

  // Verificar suporte da Web Speech API - CORRIGIDO
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                            (window as any).webkitSpeechRecognition;
    
    const isFirefox = /firefox/i.test(navigator.userAgent);
    
    if (!SpeechRecognition || isFirefox) {
      setIsSpeechSupported(false);
      return;
    }

    // Configuração CORRIGIDA do SpeechRecognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Mudado para true
    recognitionRef.current.interimResults = true; // Mudado para true
    recognitionRef.current.lang = 'pt-BR';
    
    // Timeout para detecção de silêncio (10 segundos)
    recognitionRef.current.onstart = () => {
      console.log('Reconhecimento iniciado');
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Atualiza com resultados intermediários e finais
      const newText = finalTranscript || interimTranscript;
      if (newText) {
        setTranscribedText(newText);
        setFormData(prev => ({
          ...prev,
          descricao_sintomas: newText
        }));
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erro na transcrição:', event.error);
      
      // Tratamento específico para "no-speech"
      if (event.error === 'no-speech') {
        setError('Não foi detectada nenhuma fala. Tente novamente falando mais claramente.');
      } else if (event.error === 'audio-capture') {
        setError('Não foi possível acessar o microfone. Verifique as permissões.');
      } else {
        setError(`Erro na transcrição: ${event.error}`);
      }
      
      setIsTranscribing(false);
    };

    recognitionRef.current.onend = () => {
      console.log('Reconhecimento finalizado');
      setIsTranscribing(false);
      
      // Se ainda estiver gravando, reinicia o reconhecimento
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.log('Reconhecimento já iniciado');
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    setShowInstructions(isRecording);
  }, [isRecording]);

  // Função de gravação CORRIGIDA
  async function startRecording() {
    if (!isSpeechSupported) {
      alert("Gravação de voz não suportada neste navegador. Use Chrome, Edge ou Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream; // Salva referência do stream

      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm; codecs=opus' 
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm; codecs=opus' 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // NÃO inicia transcrição aqui - já está rodando durante a gravação
        setIsTranscribing(false);
      };

      // INICIAR reconhecimento de voz ANTES de começar a gravar
      if (recognitionRef.current) {
        setIsTranscribing(true);
        setTranscribedText("");
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.log('Reconhecimento já em andamento');
        }
      }

      // Iniciar gravação
      mediaRecorder.start(1000); // Coletar dados a cada 1 segundo
      setIsRecording(true);
      setTranscribedText("");
      setError("");

    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(false);
      
      // Parar reconhecimento de voz
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Parar stream de áudio
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }

  // Função auxiliar para usar texto transcrito
  function useTranscribedText() {
    setTextInput(prev => {
      const newText = prev + (prev ? " " : "") + transcribedText;
      setFormData(prevForm => ({
        ...prevForm,
        descricao_sintomas: newText
      }));
      return newText;
    });
  }

  // Restante do código permanece similar...
  const [formData, setFormData] = useState<EmergencyForm>({
    pet_id: "",
    descricao_sintomas: "",
    nivel_urgencia: "media"
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
        nivel_urgencia: formData.nivel_urgencia
        // tutor_id e veterinario_id serão tratados no backend
        // data_abertura, status, etc. serão definidos automaticamente
      };

      const res = await fetch("http://localhost:8000/api/emergencias", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao enviar relatório");
      }

      const data = await res.json();
      setReport("Relatório enviado com sucesso!");
      
      // Reset form
      setFormData({
        pet_id: "",
        descricao_sintomas: "",
        nivel_urgencia: "media"
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
    { id: "3", name: "Thor" }
  ];

  return (
    <div className="p-6 max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Enviar Relatório de Emergência</h1>

      {showInstructions && (
        <p className="mb-2 text-gray-600 animate-fadeIn">Gravando... fale claramente.</p>
      )}
      
      {isTranscribing && (
        <p className="mb-2 text-blue-600">Transcrevendo áudio...</p>
      )}
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {report && <p className="text-green-600 mb-4">{report}</p>}

      {/* Formulário */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Selecione o Pet:</label>
          <select 
            value={formData.pet_id}
            onChange={(e) => setFormData(prev => ({ ...prev, pet_id: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecione um pet</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nível de Urgência:</label>
          <select 
            value={formData.nivel_urgencia}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              nivel_urgencia: e.target.value as EmergencyForm['nivel_urgencia'] 
            }))}
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
            <button 
              onClick={stopRecording} 
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              ⏹️ Parar Gravação
            </button>
          )}
        </div>

        {/* Transcrição */}
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
        
        <p className="text-sm text-gray-600">
          Caracteres: {formData.descricao_sintomas.length}
        </p>
      </div>

      {/* Preview do Áudio */}
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