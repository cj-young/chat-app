"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import SendIcon from "@/public/paper-plane-solid.svg";
import { ITempMessage } from "@/types/user";
import { FormEvent, KeyboardEvent, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { v4 } from "uuid";
import styles from "./styles.module.scss";

interface Props {
  chatName: string;
  submitRoute: string;
  addTempMessage(message: ITempMessage): void;
}

export default function ChatInput({
  chatName,
  submitRoute,
  addTempMessage
}: Props) {
  const [message, setMessage] = useState("");
  const { profile } = useAuthContext();

  async function sendMessage(e?: FormEvent) {
    if (e) e.preventDefault();
    const tempId = v4();
    addTempMessage({
      content: message,
      sender: profile,
      id: tempId,
      timestamp: new Date()
    });
    setMessage("");
    await apiFetch(submitRoute, "POST", {
      content: message,
      tempId
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <form className={styles["input-form"]} onSubmit={sendMessage}>
      <TextareaAutosize
        placeholder={`Send a message to ${chatName}`}
        className={styles["input"]}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxRows={message.length > 0 ? 5 : 1}
        minRows={1}
        rows={1}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className={styles["send-button"]}>
        <SendIcon />
      </button>
    </form>
  );
}
