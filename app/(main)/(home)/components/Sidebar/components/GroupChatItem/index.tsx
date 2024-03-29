"use client";
import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import usePusherEvent from "@/hooks/usePusherEvent";
import { apiFetch } from "@/lib/api";
import { IClientGroupChat, IClientMessage, IProfile } from "@/types/user";
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
  const { setGroupChats } = useAuthContext();
  const { closeMobileNav } = useUiContext();

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
        apiFetch(`/group-chat/reset-unread/${groupChat.chatId}`);
      }
    }
  );

  usePusherEvent(
    `private-groupChat-${groupChat.chatId}`,
    "usersAdded",
    ({ users }: { users: IProfile[] }) => {
      const userSet = new Set(users.map((user) => user.id));
      setGroupChats((prev) =>
        prev.map((prevGroupChat) => {
          if (prevGroupChat.chatId === groupChat.chatId) {
            return {
              ...prevGroupChat,
              members: [
                ...prevGroupChat.members.filter(
                  (member) => !userSet.has(member.id)
                ),
                ...users
              ]
            };
          } else {
            return prevGroupChat;
          }
        })
      );
    }
  );

  usePusherEvent(
    `private-groupChat-${groupChat.chatId}`,
    "userLeft",
    (userId: string) => {
      setGroupChats((prev) =>
        prev.map((prevGroupChat) => {
          if (prevGroupChat.chatId === groupChat.chatId) {
            return {
              ...prevGroupChat,
              members: prevGroupChat.members.filter(
                (member) => member.id !== userId
              )
            };
          } else {
            return prevGroupChat;
          }
        })
      );
    }
  );

  function handleClick() {
    if (isBeingViewed) {
      closeMobileNav();
    } else {
      router.push(`/gc/${groupChat.chatId}`);
    }
  }

  return (
    <li className={styles["group-chat-item"]}>
      <button
        onClick={handleClick}
        className={[
          styles["button"],
          isBeingViewed ? styles["selected"] : ""
        ].join(" ")}
      >
        <div className={styles["info"]}>
          <img
            src={groupChat.imageUrl}
            className={styles["group-chat-image"]}
            alt=""
          />
          <div className={styles["names"]}>
            <span className={styles["display-name"]}>
              {groupChat.members.length > 0
                ? groupChat.members
                    .map((member) => member.displayName)
                    .join(", ")
                : "Empty group chat"}
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
