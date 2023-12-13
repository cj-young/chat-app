"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { IClientDm, IClientMessage } from "@/types/user";
import DmNavbar from "../DmNavbar";
import styles from "./styles.module.scss";

interface Props {
  directMessageChat: IClientDm;
  messages: IClientMessage[];
  allLoaded: boolean;
}

export default async function DmChatContainer({
  directMessageChat,
  messages,
  allLoaded
}: Props) {
  return (
    <main className={styles["chat-page-container"]}>
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
