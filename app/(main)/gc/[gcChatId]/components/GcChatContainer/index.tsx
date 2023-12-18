"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { IClientGroupChat, IClientMessage, ITempMessage } from "@/types/user";
import { useEffect, useState } from "react";
import GcNavbar from "../GcNavbar";
import styles from "./styles.module.scss";

interface Props {
  groupChat: IClientGroupChat;
  messages: IClientMessage[];
  allLoaded: boolean;
}

export default function GcChatContainer({
  groupChat,
  messages,
  allLoaded
}: Props) {
  const { mobileNavExpanded } = useUiContext();
  const { setDirectMessages, profile } = useAuthContext();
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);

  useEffect(() => {
    apiFetch(`/gc/reset-unread/${groupChat.chatId}`);

    setDirectMessages((prev) =>
      prev.map((prevChat) => {
        if (prevChat.chatId === groupChat.chatId) {
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
      <GcNavbar groupChat={groupChat} />
      <Chat
        initialMessages={messages}
        chatId={groupChat.chatId}
        initialAllLoaded={allLoaded}
        tempMessages={tempMessages}
        removeTempMessage={(tempId: string) => {
          setTempMessages((prev) =>
            prev.filter((prevMessage) => prevMessage.id !== tempId)
          );
        }}
        chatType="groupChat"
      />
      <ChatInput
        chatName={groupChat.members
          .map((member) => member.displayName)
          .join(", ")}
        submitRoute={`/group-chat/message/${groupChat.chatId}`}
        addTempMessage={(message: ITempMessage) => {
          setTempMessages((prev) => [...prev, message]);
        }}
      />
    </main>
  );
}
