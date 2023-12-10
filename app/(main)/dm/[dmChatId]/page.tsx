import Chat from "@/components/Chat";
import ChatInput from "@/components/ChatInput";
import styles from "./page.module.scss";

export default function DmChat() {
  return (
    <div className={styles["chat-page-container"]}>
      <Chat />
      <ChatInput chatName="test" submitRoute="/dm/asdf" />
    </div>
  );
}
