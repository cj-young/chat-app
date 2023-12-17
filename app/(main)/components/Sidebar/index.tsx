"use client";
import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import PlusSymbol from "@/public/plus-solid.svg";
import FriendsIcon from "@/public/user-group-solid.svg";
import Link from "next/link";
import AddConversationModal from "../AddConversationModal";
import DirectMessageItem from "./components/DirectMessageItem";
import styles from "./styles.module.scss";

export default function Sidebar() {
  const { mobileNavExpanded } = useUiContext();

  const { friendRequests, directMessages } = useAuthContext();
  const { addModal } = useUiContext();

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <nav className={styles["nav"]}>
        <Link href="/" className={styles["friends"]}>
          <FriendsIcon />
          <span>Friends</span>
          {friendRequests.length > 0 && (
            <NumberBadge
              number={friendRequests.length}
              className={styles["friends-notification-badge"]}
            />
          )}
        </Link>
        <h2 className={styles["conversations-header"]}>Conversations</h2>
        <button
          className={styles["add-conversation"]}
          onClick={() => addModal(<AddConversationModal />)}
        >
          <PlusSymbol />
        </button>
        <ul className={styles["conversations-list"]}>
          {directMessages
            .sort(
              (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
            )
            .map((dm) => (
              <DirectMessageItem directMessage={dm} key={dm.chatId} />
            ))}
        </ul>
      </nav>
    </div>
  );
}
