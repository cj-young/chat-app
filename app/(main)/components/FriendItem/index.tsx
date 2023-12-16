"use clien";
import PopupMenu from "@/components/PopupMenu";
import ProfilePicture from "@/components/ProfilePicture";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { formatOnlineStatus } from "@/lib/user";
import EllipsisIcon from "@/public/ellipsis-solid.svg";
import ChatIcon from "@/public/message-solid.svg";
import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function FriendItem({ user }: Props) {
  const { addPopupMenu } = useUiContext();

  async function removeFriend() {
    try {
      const res = await apiFetch("/friends/remove", "POST", {
        receiverId: user.id
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("An error occurred");
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
        <button className={styles["button"]}>
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
