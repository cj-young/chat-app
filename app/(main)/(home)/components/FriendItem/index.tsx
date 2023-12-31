"use client";
import PopupMenu from "@/components/PopupMenu";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { formatOnlineStatus } from "@/lib/user";
import EllipsisIcon from "@/public/ellipsis-solid.svg";
import ChatIcon from "@/public/message-solid.svg";
import { IProfile } from "@/types/user";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function FriendItem({ user }: Props) {
  const { addPopupMenu } = useUiContext();
  const { directMessages } = useAuthContext();
  const router = useRouter();

  async function removeFriend() {
    try {
      const res = await apiFetch("/friends/remove", "POST", {
        receiverId: user.id
      });
      const data = await res.json();
    } catch (error) {
      console.error("An error occurred");
    }
  }

  async function goToDm() {
    try {
      const existingDm = directMessages.find((dm) => dm.user.id == user.id);
      if (existingDm) {
        router.push(`/dm/${existingDm.chatId}`);
      }

      const res = await apiFetch("/dm/add-or-open", "POST", {
        receiverId: user.id
      });
      const data = await res.json();

      if (!res.ok || !data.chatId) {
        console.error(data.message);
      }

      router.push(`/dm/${data.chatId}`);
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
        <button className={styles["button"]} onClick={goToDm}>
          <ChatIcon />
        </button>
        <button
          className={styles["button"]}
          onClick={(e) => {
            addPopupMenu(
              <PopupMenu
                items={[{ content: "Remove friend", onClick: removeFriend }]}
                x={e.clientX}
                y={e.clientY}
              />
            );
          }}
        >
          <EllipsisIcon />
        </button>
      </div>
    </div>
  );
}
