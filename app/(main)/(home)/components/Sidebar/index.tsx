"use client";
import ProfileCard from "@/app/(main)/components/ProfileCard";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import PlusSymbol from "@/public/plus-solid.svg";
import { useMemo } from "react";
import AddConversationModal from "../AddConversationModal";
import DirectMessageItem from "./components/DirectMessageItem";
import FriendsLink from "./components/FriendsLink";
import GroupChatItem from "./components/GroupChatItem";
import styles from "./styles.module.scss";

export default function Sidebar() {
  const { mobileNavExpanded } = useUiContext();

  const { friendRequests, directMessages, groupChats } = useAuthContext();
  const { addModal } = useUiContext();

  const allConversations = useMemo(() => {
    const taggedDirectMessages = directMessages.map((directMessage) => ({
      ...directMessage,
      type: "directMessage" as const
    }));
    const taggedGroupChats = groupChats.map((groupChat) => ({
      ...groupChat,
      type: "groupChat" as const
    }));

    return [...taggedDirectMessages, ...taggedGroupChats];
  }, [directMessages, groupChats]);

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <nav className={styles["nav"]}>
        <FriendsLink />
        <h2 className={styles["conversations-header"]}>Conversations</h2>
        <button
          className={styles["add-conversation"]}
          onClick={() => addModal(<AddConversationModal />)}
        >
          <PlusSymbol />
        </button>
        <ul className={styles["conversations-list"]}>
          {allConversations
            .sort(
              (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
            )
            .map((chat) =>
              chat.type === "directMessage" ? (
                <DirectMessageItem directMessage={chat} key={chat.chatId} />
              ) : (
                <GroupChatItem groupChat={chat} key={chat.chatId} />
              )
            )}
        </ul>
      </nav>
      <ProfileCard />
    </div>
  );
}
