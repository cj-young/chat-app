import ProfilePicture from "@/components/ProfilePicture";
import { IClientDm } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  directMessageChat: IClientDm;
}

export default function DirectMessageBanner({ directMessageChat }: Props) {
  return (
    <div className={styles["banner"]}>
      <ProfilePicture
        user={directMessageChat.user}
        className={styles["profile-picture"]}
      />
      <span className={styles["display-name"]}>
        {directMessageChat.user.displayName}
      </span>
      <span className={styles["username"]}>
        {directMessageChat.user.username}
      </span>
      <span className={styles["beginning-message"]}>
        This is the beginning of your conversation with{" "}
        {directMessageChat.user.displayName}
      </span>
    </div>
  );
}
