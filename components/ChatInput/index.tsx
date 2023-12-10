"use client";
import { apiFetch } from "@/lib/api";
import SendIcon from "@/public/paper-plane-solid.svg";
import { FormEvent, useState } from "react";
import Input from "../Input";
import styles from "./styles.module.scss";

interface Props {
  chatName: string;
  submitRoute: string;
}

export default function ChatInput({ chatName, submitRoute }: Props) {
  const [message, setMessage] = useState("");

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    await apiFetch(submitRoute, "POST", {
      content: message
    });
    setMessage("");
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
