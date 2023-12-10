import NumberBadge from "@/components/NumberBadge";
import ProfilePicture from "@/components/ProfilePicture";
import { IClientDm } from "@/types/user";
import Link from "next/link";
import styles from "./styles.module.scss";

interface Props {
  directMessage: IClientDm;
}

export default function DirectMessageItem({ directMessage }: Props) {
  return (
    <li className={styles["dm-item"]}>
      <Link href={`/dm/${directMessage.chatId}`} className={styles["link"]}>
        <ProfilePicture
          user={directMessage.user}
          status={directMessage.user.onlineStatus}
        />
        <span className={styles["display-name"]}>
          {directMessage.user.displayName}
        </span>
        {directMessage.unreadMessages > 0 && (
          <NumberBadge
            number={directMessage.unreadMessages}
            className={styles["unread-count"]}
          />
        )}
      </Link>
    </li>
  );
}
