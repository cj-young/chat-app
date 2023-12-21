"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { IClientGroupChat, ITempMessage } from "@/types/user";
import { useEffect, useState } from "react";
import GcNavbar from "../GcNavbar";
import styles from "./styles.module.scss";

interface Props {
  groupChat: IClientGroupChat;
}

export default function GcChatContainer({ groupChat }: Props) {
  const { mobileNavExpanded } = useUiContext();
  const { setGroupChats } = useAuthContext();
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);

  useEffect(() => {
    apiFetch(`/group-chat/reset-unread/${groupChat.chatId}`);

    setGroupChats((prev) =>
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
        chatId={groupChat.chatId}
        tempMessages={tempMessages}
        removeTempMessage={(tempId: string) => {
          setTempMessages((prev) =>
            prev.filter((prevMessage) => prevMessage.id !== tempId)
          );
        }}
        chatType="groupChat"
        groupChat={groupChat}
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
