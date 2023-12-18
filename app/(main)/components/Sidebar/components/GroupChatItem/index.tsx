"use client";
import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import usePusherEvent from "@/hooks/usePusherEvent";
import { IClientGroupChat, IClientMessage } from "@/types/user";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import styles from "./styles.module.scss";

interface Props {
  groupChat: IClientGroupChat;
}

export default function GroupChatItem({ groupChat }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isBeingViewed = pathname.endsWith(`/gc/${groupChat.chatId}`);
  const isBeingViewedRef = useRef<boolean>();
  isBeingViewedRef.current = isBeingViewed;
  const { setDirectMessages } = useAuthContext();

  usePusherEvent(
    `private-groupChat-${groupChat.chatId}`,
    "messageSent",
    ({
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

      // if (isBeingViewedRef.current) {
      //   apiFetch(`/dm/reset-unread/${groupChat.chatId}`);
      // }
    }
  );

  return (
    <li className={styles["group-chat-item"]}>
      <button
        onClick={() => router.push(`/dm/${groupChat.chatId}`)}
        className={[
          styles["button"],
          isBeingViewed ? styles["selected"] : ""
        ].join(" ")}
      >
        <img src={groupChat.imageUrl} className={styles["group-chat-image"]} />
        <span className={styles["display-name"]}>
          {groupChat.members.map((member) => member.displayName).join(", ")}
        </span>
        {groupChat.unreadMessages > 0 && (
          <NumberBadge
            number={groupChat.unreadMessages}
            className={styles["unread-count"]}
          />
        )}
      </button>
    </li>
  );
}