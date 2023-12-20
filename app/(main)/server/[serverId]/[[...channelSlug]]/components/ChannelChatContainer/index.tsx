"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useUiContext } from "@/contexts/UiContext";
import { IClientChannel } from "@/types/server";
import { IClientMessage, ITempMessage } from "@/types/user";
import { useState } from "react";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
  initialMessages: IClientMessage[];
  allLoaded: boolean;
}

export default function ChannelChatContainer({
  channel,
  initialMessages,
  allLoaded
}: Props) {
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);
  const { mobileNavExpanded } = useUiContext();

  return (
    <main
      className={[
        styles["channel-chat-container"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <Chat
        initialMessages={initialMessages}
        chatId={channel.channelId}
        initialAllLoaded={allLoaded}
        tempMessages={tempMessages}
        removeTempMessage={(tempId: string) => {
          setTempMessages((prev) =>
            prev.filter((prevMessage) => prevMessage.id !== tempId)
          );
        }}
        chatType="server"
      />
      <ChatInput
        chatName={channel.name}
        submitRoute={`/server/message/${channel.channelId}`}
        addTempMessage={(message: ITempMessage) => {
          setTempMessages((prev) => [...prev, message]);
        }}
      />
    </main>
  );
}
