import ProfilePicture from "@/components/ProfilePicture";
import CheckIcon from "@/public/check-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function FriendRequest({ user }: Props) {
  return (
    <div className={styles["friend-request"]}>
      <div className={styles["left"]}>
        <ProfilePicture user={user} />
        <div className={styles["names"]}>
          <span className={styles["display-name"]}>{user.displayName}</span>
          <span className={styles["username"]}>{user.username}</span>
        </div>
      </div>
      <div className={styles["right"]}>
        <button
          className={[styles["button"], styles["accept"]].join(" ")}
          aria-label="Accept friend request"
        >
          <CheckIcon />
        </button>
        <button
          className={[styles["button"], styles["decline"]].join(" ")}
          aria-label="Decline friend request"
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}
