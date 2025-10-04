import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

  async function startRecording() {
    if (!isSpeechSupported) {
      alert("Gravação de voz não suportada neste navegador. Use Chrome, Edge ou Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Não foi possível acessar o microfone. Você pode digitar o relatório.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    if (!audioUrl && !textInput.trim()) {
      alert("Grave um áudio ou digite o relatório.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const formData = new FormData();
      if (audioUrl) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        formData.append("audio", blob, "report.mp3");
      }
      if (textInput.trim()) {
        formData.append("text", textInput);
      }

      const res = await fetch("http://localhost:8000/api/report", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao enviar relatório");
      }

      const data = await res.json();
      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Enviar Relatório</h1>

      {showInstructions && <p className="mb-2 text-gray-600 animate-fadeIn">Gravando... fale claramente.</p>}
      {error && <p className="text-red-500">{error}</p>}
      {report && <p className="text-green-600 mt-2">{report}</p>}

      <div className="flex gap-2 mb-4">
        {!isRecording && <button onClick={startRecording} className="bg-blue-600 text-white px-4 py-2 rounded">Iniciar Gravação</button>}
        {isRecording && <button onClick={stopRecording} className="bg-red-600 text-white px-4 py-2 rounded">Parar Gravação</button>}
      </div>

      <textarea
        placeholder="Ou digite o relatório aqui"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
        {loading ? "Enviando..." : "Enviar Relatório"}
      </button>
    </div>
  );
}