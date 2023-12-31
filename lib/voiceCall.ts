import { apiFetch } from "./api";

export const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
    }
  ]
};

export async function sendPeerOffer(
  sdp: RTCSessionDescription,
  userId: string,
  callId: string
) {
  await apiFetch(`/server/channel/webrtc/send-offer/${callId}`, "POST", {
    sdp,
    receiverId: userId
  });
}

export async function sendPeerAnswer(
  sdp: RTCSessionDescription,
  userId: string,
  callId: string
) {
  await apiFetch(`/server/channel/webrtc/send-answer/${callId}`, "POST", {
    sdp,
    receiverId: userId
  });
}

export async function sendIceCandidate(
  candidate: RTCIceCandidate,
  userId: string,
  callId: string
) {
  await apiFetch(
    `/server/channel/webrtc/send-ice-candidate/${callId}`,
    "POST",
    {
      candidate,
      receiverId: userId
    }
  );
}
