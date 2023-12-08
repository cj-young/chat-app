import ProfilePicture from "@/components/ProfilePicture";
import { formatOnlineStatus } from "@/lib/user";
import EllipsisIcon from "@/public/ellipsis-solid.svg";
import ChatIcon from "@/public/message-solid.svg";
import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function FriendItem({ user }: Props) {
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
        <button className={styles["button"]}>
          <EllipsisIcon />
        </button>
      </div>
    </div>
  );
}
