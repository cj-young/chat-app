"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import FriendRequest from "./FriendRequest";
import styles from "./styles.module.scss";

export default function FriendRequests() {
  const { friendRequests } = useAuthContext();

  return (
    <div className={styles["friend-requests"]}>
      <h2 className={styles["title"]}>Friend Requests</h2>
      {friendRequests.length > 0 ? (
        <ul className={styles["requests-list"]}>
          {friendRequests.map((request) => (
            <FriendRequest user={request} key={request.username} />
          ))}
        </ul>
      ) : (
        <p className={styles["no-pending-requests"]}>
          Pending friend requests will appear here
        </p>
      )}
    </div>
  );
}
