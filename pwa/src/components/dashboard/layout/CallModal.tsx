import React, { useEffect, useRef } from "react";

interface CallModalProps {
  visible: boolean;
  callerName?: string;
  onAccept: () => void;
  onReject: () => void;
  remoteStream: MediaStream | null;
}

export default function CallModal({
  visible,
  callerName = "Chamador",
  onAccept,
  onReject,
  remoteStream,
}: CallModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (remoteStream) {
        audioRef.current.srcObject = remoteStream as MediaStream;
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [remoteStream]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm text-center">
        <h3 className="text-lg font-semibold mb-2">📞 Chamada recebida</h3>
        <p className="text-sm text-gray-600 mb-4">De: <strong>{callerName}</strong></p>

        <div className="flex justify-center gap-4 mb-3">
          <button
            onClick={onAccept}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Atender
          </button>
          <button
            onClick={onReject}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Recusar
          </button>
        </div>

        <audio ref={audioRef} autoPlay />
      </div>
    </div>
  );
}
