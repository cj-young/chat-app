"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import SendIcon from "@/public/paper-plane-solid.svg";
import { ITempMessage } from "@/types/user";
import { FormEvent, useState } from "react";
import { v4 } from "uuid";
import Input from "../Input";
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

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
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

  return (
    <form className={styles["input-form"]} onSubmit={sendMessage}>
      <Input
        type="text"
        placeholder={`Send a message to ${chatName}`}
        className={styles["input"]}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className={styles["send-button"]}>
        <SendIcon />
      </button>
    </form>
  );
}
