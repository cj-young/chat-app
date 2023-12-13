"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useUiContext } from "@/contexts/UiContext";
import { IClientDm, IClientMessage } from "@/types/user";
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
