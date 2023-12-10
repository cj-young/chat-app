"use client";
import SendIcon from "@/public/paper-plane-solid.svg";
import Input from "../Input";
import styles from "./styles.module.scss";

interface Props {
  chatName: string;
  submitRoute: string;
}

export default function ChatInput({ chatName, submitRoute }: Props) {
  return (
    <form className={styles["input-form"]}>
      <Input
        type="text"
        placeholder={`Send a message to ${chatName}`}
        className={styles["input"]}
      />
      <button type="submit" className={styles["send-button"]}>
        <SendIcon />
      </button>
    </form>
  );
}
