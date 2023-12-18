"use client";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import styles from "./styles.module.scss";

export default function ProfileCard() {
  const { profile } = useAuthContext();

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
        {/* TODO: add buttons for settings, microphone, and sound */}
      </div>
    </div>
  );
}
