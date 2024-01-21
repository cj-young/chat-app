"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import PlusCircleIcon from "@/public/circle-plus-solid.svg";
import SendIcon from "@/public/paper-plane-solid.svg";
import { ITempMessage } from "@/types/user";
import { FormEvent, KeyboardEvent, useState } from "react";
import { useDropzone } from "react-dropzone";
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": []
    }
  });

  const { onClick: handleFileClick, ...rootProps } = getRootProps();

  function handleDrop(acceptedFiles: File[]) {
    console.log(acceptedFiles);
  }

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
    <form
      className={styles["input-form"]}
      onSubmit={sendMessage}
      {...rootProps}
    >
      <input type="file" {...getInputProps()} />
      <div className={styles["input-wrapper"]}>
        <button
          className={styles["media-input"]}
          onClick={handleFileClick}
          type="button"
        >
          <PlusCircleIcon />
        </button>
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
      </div>
      <button type="submit" className={styles["send-button"]}>
        <SendIcon />
      </button>
    </form>
  );
}
