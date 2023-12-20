"use client";
import Message from "@/components/Message";
import usePusherEvent from "@/hooks/usePusherEvent";
import useScroll from "@/hooks/useScroll";
import { apiFetch } from "@/lib/api";
import {
  IClientDm,
  IClientGroupChat,
  IClientMessage,
  ITempMessage
} from "@/types/user";
import { useCallback, useMemo, useState } from "react";
import Loader from "../Loader";
import DirectMessageBanner from "./banners/DirectMessageBanner";
import GroupChatBanner from "./banners/GroupChatBanner";
import styles from "./styles.module.scss";

interface Props {
  initialMessages: IClientMessage[];
  chatId: string;
  initialAllLoaded: boolean;
  chatType: "directMessage" | "groupChat" | "server";
  directMessageChat?: IClientDm;
  tempMessages?: ITempMessage[];
  removeTempMessage?(tempId: string): void;
  groupChat?: IClientGroupChat;
}

const MESSAGE_FETCH_SCROLL_BUFFER = "40rem";

export default function Chat({
  initialMessages,
  chatId,
  initialAllLoaded,
  directMessageChat,
  tempMessages,
  removeTempMessage,
  chatType,
  groupChat
}: Props) {
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [allLoaded, setAllLoaded] = useState(initialAllLoaded);

  usePusherEvent(
    `private-${chatType}-${chatId}`,
    "messageSent",
    ({
      message,
      tempId
    }: {
      message: Omit<IClientMessage, "timestamp"> & { timestamp: string };
      tempId: string;
    }) => {
      setMessages((prev) => [
        { ...message, timestamp: new Date(message.timestamp) },
        ...prev
      ]);
      if (removeTempMessage) removeTempMessage(tempId);
    }
  );

  const loadMoreMessages = useCallback(async () => {
    try {
      if (isLoadingMessage) return;
      setIsLoadingMessage(true);

      const res = await apiFetch(
        `/${
          chatType === "directMessage"
            ? "dm"
            : chatType === "groupChat"
            ? "gc"
            : ""
        }/message/${chatId}?lastMessage=${
          messages[messages.length - 1] ? messages[messages.length - 1].id : ""
        }`
      );
      const data = await res.json();
      if (!res.ok) {
        return console.error(data.message ?? "An error occurred");
      }
      const newMessages = data.messages;
      if (data.noMoreMessages || newMessages.length === 0) {
        setAllLoaded(true);
      }
      for (let newMessage of newMessages) {
        newMessage.timestamp = new Date(newMessage.timestamp);
      }
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      setIsLoadingMessage(false);
    } catch (error) {
      setIsLoadingMessage(false);
    }
  }, [messages]);

  const { scrollRef } = useScroll(loadMoreMessages);

  const reversedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

  return (
    <div className={styles["chat-container"]}>
      <div className={styles["messages-container"]}>
        {allLoaded && directMessageChat && (
          <DirectMessageBanner directMessageChat={directMessageChat} />
        )}
        {allLoaded && groupChat && <GroupChatBanner groupChat={groupChat} />}
        {!allLoaded && <Loader className={styles["message-loader"]} />}
        <ul className={styles["chat-list"]}>
          {reversedMessages.map((message, i) => {
            let isInGroup = false;
            if (i > 0) {
              isInGroup =
                reversedMessages[i].sender.id ===
                  reversedMessages[i - 1].sender.id &&
                reversedMessages[i].timestamp.getTime() -
                  reversedMessages[i - 1].timestamp.getTime() <
                  5 * 60 * 1000; // True if messages are sent within 5 minutes
            }
            return (
              <Message
                message={message}
                isFirst={!isInGroup}
                key={message.id}
              />
            );
          })}
          {tempMessages?.map((message, i) => {
            let isInGroup = false;
            if (i === 0) {
              isInGroup =
                reversedMessages.length > 0 &&
                reversedMessages[reversedMessages.length - 1].sender.id ===
                  message.sender.id &&
                message.timestamp.getTime() -
                  reversedMessages[
                    reversedMessages.length - 1
                  ].timestamp.getTime() <
                  5 * 60 * 1000; // True if messages are sent within 5 minutes;
            } else {
              isInGroup =
                tempMessages[i].sender.id === tempMessages[i - 1].sender.id;
            }
            return (
              <Message
                message={message}
                isFirst={!isInGroup}
                key={message.id}
                isTemp={true}
              />
            );
          })}
        </ul>
        {!allLoaded && (
          <div
            className={styles["scroll-dummy"]}
            aria-hidden="true"
            ref={scrollRef}
            style={{ height: MESSAGE_FETCH_SCROLL_BUFFER }}
          ></div>
        )}
      </div>
    </div>
  );
}
