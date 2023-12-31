"use client";
import MessageModal from "@/components/MessageModal";
import { apiFetch } from "@/lib/api";
import { IClientChannel } from "@/types/server";
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
import { useUiContext } from "./UiContext";

interface IVoiceCallContext {
  joinVoiceCall(channel: IClientChannel): void;
  leaveVoiceCall(): void;
  call: IClientChannel | null;
  connectionStatus: string;
  toggleMicMuted(): void;
  isMicMuted: boolean;
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
  const [call, setCall] = useState<IClientChannel | null>(null);
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();
  const { profile } = useAuthContext();
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidates = useRef<Map<string, RTCIceCandidate[]>>(
    new Map()
  );
  const [connectionStatuses, setConnectionStatuses] = useState<
    Map<string, RTCPeerConnectionState>
  >(new Map());
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const isMicMutedRef = useRef<boolean>(isMicMuted);
  isMicMutedRef.current = isMicMuted;
  const didDenyMicrophone = useRef(false);
  const { addModal } = useUiContext();

  useEffect(() => {
    const statusArray = [...connectionStatuses];
    if (statusArray.some(([_id, value]) => value === "connecting")) {
      setConnectionStatus("Connecting...");
      return;
    } else if (statusArray.some(([_id, value]) => value === "disconnected")) {
      setConnectionStatus("Disconnecting...");
      return;
    } else if (
      statusArray.some(
        ([_id, value]) => value === "closed" || value === "failed"
      )
    ) {
      setConnectionStatus("Offline");
      return;
    } else {
      setConnectionStatus("Connected");
      return;
    }
  }, [connectionStatuses]);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks()[0].enabled = !isMicMuted;
  }, [isMicMuted]);

  function createPeerConnection(otherUserId: string) {
    if (!call) {
      throw new Error("'call' is not defined");
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
        sendIceCandidate(e.candidate, otherUserId, call.channelId);
      }
    };

    return peerConnection;
  }

  function closePeerConnection(peerConnection: RTCPeerConnection) {
    // Set listeners to null to prevent events while
    // connection is closing
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.onnegotiationneeded = null;
    peerConnection.close();
  }

  function closeAllPeerConnections() {
    for (let [_userId, peer] of peers.current) {
      closePeerConnection(peer);
    }
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        localStreamRef.current.getAudioTracks()[0].enabled =
          !isMicMutedRef.current;
      })
      .catch(() => {
        setIsMicMuted(true);
        didDenyMicrophone.current = true;
      });
  }, []);

  useEffect(() => {
    if (!call) {
      setStreams(new Map());
      setConnectionStatuses(new Map());
      pendingIceCandidates.current = new Map();
      return;
    }

    setConnectionStatus("Connecting...");

    const voiceChannel = pusherClient.subscribe(
      `presence-voice-${call.channelId}`
    );

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
          await sendPeerOffer(sdp, id, call.channelId);
          peers.current.set(id, peerConnection);
        } catch (error) {
          console.error(error);
        }
      };
    });

    voiceChannel.bind(
      "pusher:subscription_succeeded",
      ({ count }: { count: number }) => {
        if (count > 1) {
          setConnectionStatus("Connecting...");
        } else {
          setConnectionStatus("Connected");
        }
      }
    );

    voiceChannel.bind(
      "pusher:member_removed",
      async ({ id }: { id: string }) => {
        const newStreams = new Map([...streams]);
        newStreams.delete(id);
        setStreams(newStreams);

        const peerConnection = peers.current.get(id);
        if (!peerConnection) return;
        closePeerConnection(peerConnection);
      }
    );

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

        peerConnection.onconnectionstatechange = (e: Event) => {
          console.log(
            "Connection state change: ",
            peerConnection.connectionState
          );
          setConnectionStatuses(
            (prev) =>
              new Map([...prev, [userId, peerConnection.connectionState]])
          );
        };

        await peerConnection.setRemoteDescription(sdp);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        const answerSdp = peerConnection.localDescription;
        if (!answerSdp) {
          throw new Error("Local description not properly set");
        }

        peerConnection.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (e.candidate) {
            sendIceCandidate(e.candidate, userId, call.channelId);
          }
        };
        for (let candidate of pendingIceCandidates.current.get(userId) ?? []) {
          peerConnection.addIceCandidate(candidate);
        }
        pendingIceCandidates.current.delete(userId);

        await sendPeerAnswer(answerSdp, userId, call.channelId);
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
      pusherClient.unsubscribe(`presence-voice-${call.channelId}`);

      closeAllPeerConnections();
    };
  }, [call]);

  function leaveVoiceCall() {
    setCall(null);
  }

  async function joinVoiceCall(channel: IClientChannel) {
    if (channel.type === "text") return;
    setCall(channel);
  }

  function toggleMicMuted() {
    if (!didDenyMicrophone.current) {
      setIsMicMuted((prev) => !prev);
    } else {
      if (!isMicMuted) {
        setIsMicMuted(true);
      }
      addModal(
        <MessageModal
          title="Microphone access denied"
          message="You cannot unmute yourself because microphone access has been denied. Change this website's access to your microphone in your browser settings to unmute."
        />
      );
    }
  }

  return (
    <VoiceCallContext.Provider
      value={{
        leaveVoiceCall,
        joinVoiceCall,
        call,
        connectionStatus,
        toggleMicMuted,
        isMicMuted
      }}
    >
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
