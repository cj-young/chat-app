"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { IClientDm, IClientMessage } from "@/types/user";
import { useEffect } from "react";
import DmNavbar from "../DmNavbar";
import styles from "./styles.module.scss";

interface Props {
  directMessageChat: IClientDm;
  messages: IClientMessage[];
  allLoaded: boolean;
}

export default function DmChatContainer({
  directMessageChat,
  messages,
  allLoaded
}: Props) {
  const { mobileNavExpanded } = useUiContext();
  const { setDirectMessages } = useAuthContext();

  useEffect(() => {
    apiFetch(`/dm/reset-unread/${directMessageChat.chatId}`);

    setDirectMessages((prev) =>
      prev.map((prevChat) => {
        if (prevChat.chatId === directMessageChat.chatId) {
          return {
            ...prevChat,
            unreadMessages: 0
          };
        } else {
          return prevChat;
        }
      })
    );
  }, []);

  return (
    <main
      className={[
        styles["chat-page-container"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <DmNavbar directMessageChat={directMessageChat} />
      <Chat
        initialMessages={messages}
        chatId={directMessageChat.chatId}
        initialAllLoaded={allLoaded}
        directMessageChat={directMessageChat}
      />
      <ChatInput
        chatName={directMessageChat.user.displayName}
        submitRoute={`/dm/message/${directMessageChat.chatId}`}
      />
    </main>
  );
}
