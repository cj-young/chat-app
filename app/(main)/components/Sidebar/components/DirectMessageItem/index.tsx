"use client";
import NumberBadge from "@/components/NumberBadge";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePusher } from "@/contexts/PusherContext";
import { IClientDm, IClientMessage } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./styles.module.scss";

interface Props {
  directMessage: IClientDm;
}

export default function DirectMessageItem({ directMessage }: Props) {
  const router = useRouter();

  const { setDirectMessages } = useAuthContext();
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  useEffect(() => {
    const onMessageSent = ({
      message
    }: {
      message: Omit<IClientMessage, "timestamp"> & { timestamp: string };
    }) => {
      setDirectMessages((prev) =>
        prev.map((prevMessage) => {
          if (prevMessage.chatId === message.chatId) {
            return {
              ...prevMessage,
              lastMessageAt: new Date(message.timestamp)
            };
          } else {
            return prevMessage;
          }
        })
      );
    };

    subscribeToEvent(
      `private-directMessage-${directMessage.chatId}`,
      "messageSent",
      onMessageSent
    );

    return () => {
      unsubscribeFromEvent(
        `private-directMessage-${directMessage.chatId}`,
        "messageSent",
        onMessageSent
      );
    };
  }, []);

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
