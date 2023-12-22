"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useUiContext } from "@/contexts/UiContext";
import { IClientChannel } from "@/types/server";
import { ITempMessage } from "@/types/user";
import { useState } from "react";
import ChannelNavbar from "../ChannelNavbar";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
}

export default function ChannelChatContainer({ channel }: Props) {
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);
  const { mobileNavExpanded } = useUiContext();

  return (
    <main
      className={[
        styles["channel-chat-container"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <ChannelNavbar channel={channel} />
      <Chat
        chatId={channel.channelId}
        tempMessages={tempMessages}
        removeTempMessage={(tempId: string) => {
          setTempMessages((prev) =>
            prev.filter((prevMessage) => prevMessage.id !== tempId)
          );
        }}
        chatType="server"
        serverChannel={channel}
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
