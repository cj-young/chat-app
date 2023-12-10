"use client";
import NumberBadge from "@/components/NumberBadge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import FriendsIcon from "@/public/user-group-solid.svg";
import Link from "next/link";
import DirectMessageItem from "./components/DirectMessageItem";
import styles from "./styles.module.scss";

export default function Sidebar() {
  const { mobileNavExpanded } = useUiContext();

  const { friendRequests, directMessages } = useAuthContext();

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
        <ul className={styles["conversations-list"]}>
          {directMessages.map((dm) => (
            <>
              <DirectMessageItem directMessage={dm} key={dm.chatId} />
            </>
          ))}
        </ul>
      </nav>
    </div>
  );
}
