"use client";
import Message from "@/components/Message";
import { usePusher } from "@/contexts/PusherContext";
import { apiFetch } from "@/lib/api";
import { IClientDm, IClientMessage, ITempMessage } from "@/types/user";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loader from "../Loader";
import DirectMessageBanner from "./banners/DirectMessageBanner";
import styles from "./styles.module.scss";

interface Props {
  initialMessages: IClientMessage[];
  chatId: string;
  initialAllLoaded: boolean;
  directMessageChat?: IClientDm;
  tempMessages?: ITempMessage[];
  removeTempMessage?(tempId: string): void;
}

const MESSAGE_FETCH_SCROLL_BUFFER = "40rem";

export default function Chat({
  initialMessages,
  chatId,
  initialAllLoaded,
  directMessageChat,
  tempMessages,
  removeTempMessage
}: Props) {
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [allLoaded, setAllLoaded] = useState(initialAllLoaded);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollDummyRef = useRef<HTMLDivElement>(null);
  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  useEffect(() => {
    const onMessageSent = ({
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
    };

    subscribeToEvent(
      `private-directMessage-${chatId}`,
      "messageSent",
      onMessageSent
    );

    return () => {
      unsubscribeFromEvent(
        `private-directMessage-${chatId}`,
        "messageSent",
        onMessageSent
      );
    };
  }, []);

  const loadMoreMessages = useCallback(async () => {
    try {
      if (isLoadingMessage) return;
      setIsLoadingMessage(true);

      const res = await apiFetch(
        `/dm/message/${chatId}?lastMessage=${
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

  useEffect(() => {
    if (!scrollDummyRef?.current) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        console.log(entry);
        loadMoreMessages();
      }
    });
    observer.observe(scrollDummyRef.current);

    return () => observer.disconnect();
  }, [loadMoreMessages]);

  const reversedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

  return (
    <div className={styles["chat-container"]} ref={chatRef}>
      <div className={styles["messages-container"]}>
        {allLoaded && directMessageChat && (
          <DirectMessageBanner directMessageChat={directMessageChat} />
        )}
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
                reversedMessages[reversedMessages.length - 1].sender.id ===
                message.sender.id;
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
            ref={scrollDummyRef}
            style={{ height: MESSAGE_FETCH_SCROLL_BUFFER }}
          ></div>
        )}
      </div>
    </div>
  );
}
