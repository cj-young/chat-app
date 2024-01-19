"use client";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatOnlineStatus } from "@/lib/user";
import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function BlockedUserItem({ user }: Props) {
  const { setBlockedUsers } = useAuthContext();

  async function handleUnblockUser() {
    try {
      setBlockedUsers((prev) =>
        prev.filter((prevBlockedUser) => prevBlockedUser.id !== user.id)
      );
      await apiFetch("/user/unblock", "POST", { unblockedUserId: user.id });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles["friend-item"]}>
      <div className={styles["left"]}>
        <ProfilePicture user={user} status={user.onlineStatus} />
        <div className={styles["names"]}>
          <span className={styles["display-name"]}>{user.displayName}</span>
          <span className={styles["online-status"]}>
            {formatOnlineStatus(user.onlineStatus)}
          </span>
        </div>
      </div>
      <div className={styles["right"]}>
        <button className={styles["button"]} onClick={handleUnblockUser}>
          Unblock
        </button>
      </div>
    </div>
  );
}
