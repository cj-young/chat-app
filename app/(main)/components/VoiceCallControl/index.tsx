"use client";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import PhoneIcon from "@/public/phone-solid.svg";
import styles from "./styles.module.scss";

export default function VoiceCallControl() {
  const { leaveVoiceCall, call, connectionStatus } = useVoiceCall();

  return (
    <div className={styles["voice-call-control"]}>
      <div className={styles["call-info"]}>
        <span className={styles["connection-status"]}>{connectionStatus}</span>
        <span className={styles["call-name"]}>{call?.name}</span>
      </div>
      <button className={styles["hang-up-button"]} onClick={leaveVoiceCall}>
        <PhoneIcon />
      </button>
    </div>
  );
}
