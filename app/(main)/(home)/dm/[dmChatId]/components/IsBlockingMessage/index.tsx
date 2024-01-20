"use client";
import { IClientDm } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  dmChat: IClientDm;
}

export default function IsBlockingMessage({ dmChat }: Props) {
  return (
    <div className={styles["message-wrapper"]}>
      <div className={styles["message"]}>
        You cannot send messages to <b>{dmChat.user.displayName}</b> because you
        blocked them
      </div>
    </div>
  );
}
