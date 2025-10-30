import React, { useEffect, useRef, useState } from "react";
import { createPeerConnection, createOffer, createAnswer, addAnswer } from "../services/webrtc";
import { listenToSignals, sendSignal } from "../services/signaling";

export default function VideoCall({ userId, targetId }: { userId: string; targetId: string }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    listenToSignals(userId, async (payload) => {
      const { from, type, data } = payload;
      if (type === "offer") {
        const pc = createPeerConnection(handleCandidate, handleRemoteStream);
        pcRef.current = pc;
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(media);
        const answer = await createAnswer(pc, data, media);
        await sendSignal(userId, from, "answer", answer);
      } else if (type === "answer") {
        await addAnswer(pcRef.current!, data);
      } else if (type === "candidate") {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  }, []);

  const handleCandidate = (candidate: any) => {
    sendSignal(userId, targetId, "candidate", candidate);
  };

  const handleRemoteStream = (remoteStream: MediaStream) => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  };

  const startCall = async () => {
    const pc = createPeerConnection(handleCandidate, handleRemoteStream);
    pcRef.current = pc;
    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(media);
    const offer = await createOffer(pc, media);
    await sendSignal(userId, targetId, "offer", offer);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Chamada de Vídeo</h2>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-48 rounded-lg bg-gray-200" />
        <video ref={remoteVideoRef} autoPlay className="w-48 rounded-lg bg-gray-200" />
      </div>
      <button
        onClick={startCall}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Iniciar Chamada
      </button>
    </div>
  );
}
