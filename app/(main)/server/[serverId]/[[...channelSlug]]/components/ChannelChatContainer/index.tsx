"use client";
import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import { useUiContext } from "@/contexts/UiContext";
import { IClientChannel } from "@/types/server";
import { ITempMessage } from "@/types/user";
import { useEffect, useState } from "react";
import ChannelNavbar from "../ChannelNavbar";
import ServerMemberList from "../MemberList";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
}

export default function ChannelChatContainer({ channel }: Props) {
  const [tempMessages, setTempMessages] = useState<ITempMessage[]>([]);
  const { mobileNavExpanded } = useUiContext();
  const [membersShown, setMembersShown] = useState(false);

  function toggleMembersShown() {
    setMembersShown((prev) => !prev);
  }

  useEffect(() => {}, []);

  return (
    <main
      className={[
        styles["main-container"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <div
        className={[
          styles["channel-chat-container"],
          membersShown ? styles["hidden"] : ""
        ].join(" ")}
      >
        <ChannelNavbar
          channel={channel}
          toggleMembersShown={toggleMembersShown}
        />
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
      </div>
      {membersShown && (
        <div className={styles["member-list-container"]}>
          <ServerMemberList toggleMenu={toggleMembersShown} />
        </div>
      )}
    </main>
  );
}
