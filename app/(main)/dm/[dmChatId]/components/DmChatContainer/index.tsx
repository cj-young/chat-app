"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { IClientDm, IClientMessage, ITempMessage } from "@/types/user";
import { useEffect, useState } from "react";
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
  const { setDirectMessages, profile } = useAuthContext();
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);

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
        tempMessages={tempMessages}
        removeTempMessage={(tempId: string) => {
          setTempMessages((prev) =>
            prev.filter((prevMessage) => prevMessage.id !== tempId)
          );
        }}
        chatType="directMessage"
      />
      <ChatInput
        chatName={directMessageChat.user.displayName}
        submitRoute={`/dm/message/${directMessageChat.chatId}`}
        addTempMessage={(message: ITempMessage) => {
          setTempMessages((prev) => [...prev, message]);
        }}
      />
    </main>
  );
}
