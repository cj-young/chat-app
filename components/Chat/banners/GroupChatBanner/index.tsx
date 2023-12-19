import { IClientGroupChat } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  groupChat: IClientGroupChat;
}

export default function GroupChatBanner({ groupChat }: Props) {
  return (
    <div className={styles["banner"]}>
      <img src={groupChat.imageUrl} className={styles["group-chat-image"]} />
      <span className={styles["member-names"]}>
        {groupChat.members.length > 0
          ? groupChat.members.map((member) => member.displayName).join(", ")
          : "Empty group chat"}
      </span>
      <span className={styles["beginning-message"]}>
        This is the beginning of your conversation with{" "}
        {groupChat.members.length === 0
          ? "yourself"
          : groupChat.members.length === 1
          ? groupChat.members[0].username
          : groupChat.members.length === 2
          ? groupChat.members.map((member) => member.username).join(" and ")
          : groupChat.members
              .slice(0, groupChat.members.length - 1)
              .map((member) => member.username)
              .join(", ") +
            " and " +
            groupChat.members[groupChat.members.length - 1].username}
      </span>
    </div>
  );
}
