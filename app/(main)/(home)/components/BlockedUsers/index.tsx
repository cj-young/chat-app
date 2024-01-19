"use client";
import BlockedUserItem from "../BlockedUserItem";
import styles from "./styles.module.scss";

import { useAuthContext } from "@/contexts/AuthContext";

export default function BlockedUsers() {
  const { blockedUsers } = useAuthContext();

  return (
    <div className={styles["blocked-users"]}>
      <h2 className={styles["title"]}>Blocked</h2>
      {blockedUsers.length > 0 ? (
        <ul className={styles["blocked-users-list"]}>
          {blockedUsers.map((friend) => (
            <BlockedUserItem user={friend} key={friend.username} />
          ))}
        </ul>
      ) : (
        <p className={styles["no-blocked-users"]}>
          Blocked users will appear here
        </p>
      )}
    </div>
  );
}
