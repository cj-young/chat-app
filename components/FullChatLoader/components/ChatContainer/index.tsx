import ChatLoadingState from "@/components/Chat/components/LoadingState";
import styles from "./styles.module.scss";

export default function LoaderChatContainer({}) {
  return (
    <div className={styles["chat-container"]}>
      <div className={styles["messages-container"]}>
        <ChatLoadingState />
      </div>
    </div>
  );
}
