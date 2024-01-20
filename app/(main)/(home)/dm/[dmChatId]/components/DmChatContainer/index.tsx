"use client";
import CannotMessage from "@/components/CannotMessage";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { IClientDm, ITempMessage } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import DmNavbar from "../DmNavbar";
import IsBlockingMessage from "../IsBlockingMessage";
import styles from "./styles.module.scss";

interface Props {
  directMessageChat: IClientDm;
  canSendMessages?: boolean;
}

export default function DmChatContainer({
  directMessageChat,
  canSendMessages = true
}: Props) {
  const { mobileNavExpanded } = useUiContext();
  const { setDirectMessages, blockedUsers } = useAuthContext();
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);

  const isBlockingUser = useMemo(() => {
    return blockedUsers.some(
      (blockedUser) => blockedUser.id === directMessageChat.user.id
    );
  }, [blockedUsers]);

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
        chatId={directMessageChat.chatId}
        directMessageChat={directMessageChat}
        tempMessages={tempMessages}
        removeTempMessage={(tempId: string) => {
          setTempMessages((prev) =>
            prev.filter((prevMessage) => prevMessage.id !== tempId)
          );
        }}
        chatType="directMessage"
      />
      {isBlockingUser ? (
        <IsBlockingMessage dmChat={directMessageChat} />
      ) : !canSendMessages ? (
        <CannotMessage />
      ) : (
        <ChatInput
          chatName={directMessageChat.user.displayName}
          submitRoute={`/dm/message/${directMessageChat.chatId}`}
          addTempMessage={(message: ITempMessage) => {
            setTempMessages((prev) => [...prev, message]);
          }}
        />
      )}
    </main>
  );
}
