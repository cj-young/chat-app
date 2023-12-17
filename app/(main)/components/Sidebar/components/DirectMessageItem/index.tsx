"use client";
import NumberBadge from "@/components/NumberBadge";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePusher } from "@/contexts/PusherContext";
import { apiFetch } from "@/lib/api";
import { IClientDm, IClientMessage } from "@/types/user";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

interface Props {
  directMessage: IClientDm;
}

export default function DirectMessageItem({ directMessage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isBeingViewed = pathname.endsWith(directMessage.chatId);
  const isBeingViewedRef = useRef<boolean>();
  isBeingViewedRef.current = isBeingViewed;

  const { setDirectMessages } = useAuthContext();
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  useEffect(() => {
    const onMessageSent = ({
      message
    }: {
      message: Omit<IClientMessage, "timestamp"> & { timestamp: string };
    }) => {
      setDirectMessages((prev) =>
        prev.map((prevChat) => {
          if (prevChat.chatId === message.chatId) {
            return {
              ...prevChat,
              unreadMessages: isBeingViewedRef.current
                ? 0
                : prevChat.unreadMessages + 1,
              lastMessageAt: new Date(message.timestamp)
            };
          } else {
            return prevChat;
          }
        })
      );

      if (isBeingViewedRef.current) {
        apiFetch(`/dm/reset-unread/${directMessage.chatId}`);
      }
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
        className={[
          styles["button"],
          isBeingViewed ? styles["selected"] : ""
        ].join(" ")}
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
