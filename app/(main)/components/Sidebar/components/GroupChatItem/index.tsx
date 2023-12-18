"use client";
import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import usePusherEvent from "@/hooks/usePusherEvent";
import { apiFetch } from "@/lib/api";
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
  const { setDirectMessages, setGroupChats } = useAuthContext();

  usePusherEvent(
    `private-groupChat-${groupChat.chatId}`,
    "messageSent",
    ({
      message
    }: {
      message: Omit<IClientMessage, "timestamp"> & { timestamp: string };
    }) => {
      setGroupChats((prev) =>
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
        apiFetch(`/gc/reset-unread/${groupChat.chatId}`);
      }
    }
  );

  return (
    <li className={styles["group-chat-item"]}>
      <button
        onClick={() => router.push(`/gc/${groupChat.chatId}`)}
        className={[
          styles["button"],
          isBeingViewed ? styles["selected"] : ""
        ].join(" ")}
      >
        <div className={styles["info"]}>
          <img
            src={groupChat.imageUrl}
            className={styles["group-chat-image"]}
          />
          <div className={styles["names"]}>
            <span className={styles["display-name"]}>
              {groupChat.members.map((member) => member.displayName).join(", ")}
            </span>
            <span className={styles["member-count"]}>
              {groupChat.members.length + 1} member
              {groupChat.members.length > 0 ? "s" : ""}
            </span>
          </div>
        </div>
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
