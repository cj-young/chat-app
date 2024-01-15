"use client";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import SettingsIcon from "@/public/gear-solid.svg";
import MutedMicrophoneIcon from "@/public/microphone-slash-solid.svg";
import MicrophoneIcon from "@/public/microphone-solid-wide.svg";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

export default function ProfileCard() {
  const { profile } = useAuthContext();
  const { isMicMuted, toggleMicMuted } = useVoiceCall();
  const router = useRouter();

  function goToSettings() {
    router.push("/settings");
  }

  return (
    <div className={styles["profile-card"]}>
      <div className={styles["profile-info"]}>
        <ProfilePicture user={profile} status={profile.onlineStatus} />
        <div className={styles["names"]}>
          <span className={styles["display-name"]}>{profile.displayName}</span>
          <span className={styles["username"]}>{profile.username}</span>
        </div>
      </div>
      <div className={styles["buttons"]}>
        {/* TODO: add buttons for settings and sound */}
        <button
          className={[
            styles["microphone-mute-toggle"],
            styles["button"],
            isMicMuted ? styles["muted"] : styles["unmuted"]
          ].join(" ")}
          onClick={toggleMicMuted}
          aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMicMuted ? <MutedMicrophoneIcon /> : <MicrophoneIcon />}
        </button>
        <button
          className={[styles["button"], styles["settings-button"]].join(" ")}
          onClick={goToSettings}
          aria-label="Go to settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </div>
  );
}
