"use client";
import NumberBadge from "@/components/NumberBadge";
import ProfilePicture from "@/components/ProfilePicture";
import { IClientDm } from "@/types/user";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface Props {
  directMessage: IClientDm;
}

export default function DirectMessageItem({ directMessage }: Props) {
  const router = useRouter();

  return (
    <li className={styles["dm-item"]}>
      <button
        onClick={() => router.push(`/dm/${directMessage.chatId}`)}
        className={styles["button"]}
      >
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
      </button>
    </li>
  );
}
