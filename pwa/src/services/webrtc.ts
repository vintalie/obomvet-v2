export function createPeerConnection(onIceCandidate: (candidate: any) => void, onTrack: (stream: MediaStream) => void) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(event.candidate);
  };

  pc.ontrack = (event) => {
    onTrack(event.streams[0]);
  };

  return pc;
}

export async function createOffer(pc: RTCPeerConnection, stream: MediaStream) {
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function createAnswer(pc: RTCPeerConnection, offer: RTCSessionDescriptionInit, stream: MediaStream) {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function addAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}
