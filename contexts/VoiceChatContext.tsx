"use client";
import { apiFetch } from "@/lib/api";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useAuthContext } from "./AuthContext";
import { usePusher } from "./PusherContext";

interface IVoiceCallContext {
  joinVoiceCall(callId: string): void;
  leaveVoiceCall(): void;
}

interface Props {
  children: ReactNode;
}

const VoiceCallContext = createContext<IVoiceCallContext>(
  {} as IVoiceCallContext
);

const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
    }
  ]
};

async function sendPeerOffer(
  sdp: RTCSessionDescription,
  userId: string,
  callId: string
) {
  await apiFetch(`/server/channel/webrtc/send-offer/${callId}`, "POST", {
    sdp,
    receiverId: userId
  });
}

async function sendPeerAnswer(
  sdp: RTCSessionDescription,
  userId: string,
  callId: string
) {
  await apiFetch(`/server/channel/webrtc/send-answer/${callId}`, "POST", {
    sdp,
    receiverId: userId
  });
}

async function sendIceCandidate(
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

export default function VoiceCallContextProvider({ children }: Props) {
  const [callId, setCallId] = useState<string | null>(null);
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();
  const { profile } = useAuthContext();
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidates = useRef<Map<string, RTCIceCandidate[]>>(
    new Map()
  );

  function createPeerConnection(otherUserId: string) {
    if (!callId) {
      throw new Error("'callId' is not defined");
    }
    const peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.ontrack = (e: RTCTrackEvent) => {
      if (e.streams) {
        setStreams((prev) => new Map([...prev, [otherUserId, e.streams[0]]]));
      }
    };

    if (localStreamRef.current) {
      for (let track of localStreamRef.current.getTracks()) {
        peerConnection.addTrack(track, localStreamRef.current);
      }
    }

    peerConnection.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate) {
        sendIceCandidate(e.candidate, otherUserId, callId);
      }
    };

    return peerConnection;
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => (localStreamRef.current = stream));
  }, []);

  useEffect(() => {
    if (!callId) return;

    const voiceChannel = pusherClient.subscribe(`presence-voice-${callId}`);

    voiceChannel.bind("pusher:member_added", async ({ id }: { id: string }) => {
      const peerConnection = createPeerConnection(id);
      peers.current.set(id, peerConnection);

      peerConnection.onnegotiationneeded = async () => {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          const sdp = peerConnection.localDescription;
          if (!sdp) {
            throw new Error("Local description not properly set");
          }
          await sendPeerOffer(sdp, id, callId);
          peers.current.set(id, peerConnection);
        } catch (error) {
          console.error(error);
        }
      };
    });

    const onRtcPeerOffer = async ({
      sdp,
      userId
    }: {
      sdp: RTCSessionDescription;
      userId: string;
    }) => {
      try {
        const peerConnection = createPeerConnection(userId);
        peers.current.set(userId, peerConnection);

        await peerConnection.setRemoteDescription(sdp);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        const answerSdp = peerConnection.localDescription;
        if (!answerSdp) {
          throw new Error("Local description not properly set");
        }

        peerConnection.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (e.candidate) {
            sendIceCandidate(e.candidate, userId, callId);
          }
        };
        for (let candidate of pendingIceCandidates.current.get(userId) ?? []) {
          peerConnection.addIceCandidate(candidate);
        }
        pendingIceCandidates.current.delete(userId);

        await sendPeerAnswer(answerSdp, userId, callId);
      } catch (error) {
        console.error(error);
      }
    };

    subscribeToEvent(
      `private-user-${profile.id}`,
      "rtcPeerOffer",
      onRtcPeerOffer
    );

    const onRtcPeerAnswer = async ({
      sdp,
      userId
    }: {
      sdp: RTCSessionDescription;
      userId: string;
    }) => {
      try {
        const peerConnection = peers.current.get(userId);
        if (!peerConnection) {
          throw new Error("Peer connection not found in RTC answer retrieval");
        }
        await peerConnection.setRemoteDescription(sdp);
        for (let candidate of pendingIceCandidates.current.get(userId) ?? []) {
          peerConnection.addIceCandidate(candidate);
        }
        pendingIceCandidates.current.delete(userId);
        peers.current.set(userId, peerConnection);
      } catch (error) {
        console.error(error);
      }
    };

    subscribeToEvent(
      `private-user-${profile.id}`,
      "rtcPeerAnswer",
      onRtcPeerAnswer
    );

    const onRtcIceCandidateSent = async ({
      candidate,
      userId
    }: {
      candidate: RTCIceCandidate;
      userId: string;
    }) => {
      try {
        const peerConnection = peers.current.get(userId);
        if (!peerConnection?.remoteDescription) {
          if (!pendingIceCandidates.current?.has(userId)) {
            pendingIceCandidates.current.set(userId, []);
          }

          pendingIceCandidates.current.get(userId)!.push(candidate);
          return;
        }
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error(error);
      }
    };

    subscribeToEvent(
      `private-user-${profile.id}`,
      "rtcIceCandidateSent",
      onRtcIceCandidateSent
    );

    return () => {
      unsubscribeFromEvent(
        `private-user-${profile.id}`,
        "rtcPeerOffer",
        onRtcPeerOffer
      );
      unsubscribeFromEvent(
        `private-user-${profile.id}`,
        "rtcPeerAnswer",
        onRtcPeerAnswer
      );
      unsubscribeFromEvent(
        `private-user-${profile.id}`,
        "rtcIceCandidateSent",
        onRtcIceCandidateSent
      );
    };
  }, [callId]);

  function leaveVoiceCall() {
    setCallId(null);
  }

  async function joinVoiceCall(callId: string) {
    setCallId(callId);
  }

  return (
    <VoiceCallContext.Provider value={{ leaveVoiceCall, joinVoiceCall }}>
      {children}
      {[...streams].map(([userId, stream]) => (
        <PeerAudio stream={stream} key={userId} />
      ))}
    </VoiceCallContext.Provider>
  );
}

export function useVoiceCall() {
  return useContext(VoiceCallContext);
}

function PeerAudio({ stream }: { stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = stream;
  }, [stream]);
  return <audio autoPlay ref={audioRef} />;
}
