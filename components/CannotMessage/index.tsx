"use client";
import styles from "./styles.module.scss";

export default function CannotMessage() {
  return (
    <div className={styles["message-wrapper"]}>
      <div className={styles["message"]}>You cannot send messages here</div>
    </div>
  );
}
