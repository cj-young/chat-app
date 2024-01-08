"use client";
import ProfilePicture from "@/components/ProfilePicture";
import { useAudio } from "@/contexts/AudioContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import { IProfile } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
  isPreview?: boolean;
}

const IS_SPEAKING_MINIMUM_VOLUME = 8;
const MOVING_AVERAGE_WINDOW_MS = 20;

export default function VoiceCallMember({ user, isPreview }: Props) {
  const { streams, localStreamRef } = useVoiceCall();
  const { profile } = useAuthContext();
  const { audioContext } = useAudio();
  const analyzerRef = useRef<AnalyserNode>();
  const lastAnimationFrame = useRef<number>(Date.now());
  const smoothedVolume = useRef(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animationRequst = useRef<number>();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(smoothedVolume.current >= IS_SPEAKING_MINIMUM_VOLUME);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!audioContext) return;

    let stream: MediaStream | null;
    if (profile.id === user.id) {
      stream = localStreamRef.current;
    } else {
      stream = streams.get(user.id) ?? null;
    }
    if (!stream) return;

    analyzerRef.current = new AnalyserNode(audioContext, { fftSize: 128 });

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzerRef.current);
    animationRequst.current = requestAnimationFrame(checkAudioLevel);

    return () => {
      cancelAnimationFrame(animationRequst.current ?? 0);
    };
  }, [audioContext, streams, user, profile]);

  function checkAudioLevel() {
    const dataArray = new Uint8Array(
      analyzerRef.current?.frequencyBinCount ?? 0
    );
    if (analyzerRef.current) {
      analyzerRef.current.getByteFrequencyData(dataArray);
      const currentVolume =
        dataArray.reduce((acc, curr) => acc + curr, 0) / dataArray.length;

      const timeDelta = Date.now() - lastAnimationFrame.current;
      const newSmoothedVolume =
        smoothedVolume.current +
        ((currentVolume - smoothedVolume.current) * timeDelta) /
          MOVING_AVERAGE_WINDOW_MS;

      smoothedVolume.current = newSmoothedVolume;
      lastAnimationFrame.current = Date.now();
    }

    animationRequst.current = requestAnimationFrame(checkAudioLevel);
  }

  return (
    <li
      className={[
        styles["voice-call-member"],
        isPreview ? styles["preview"] : ""
      ].join(" ")}
    >
      <ProfilePicture user={user} className={styles["profile-picture"]} />
      <span
        className={[
          styles["display-name"],
          isSpeaking ? styles["is-speaking"] : ""
        ].join(" ")}
      >
        {user.displayName}
      </span>
    </li>
  );
}
