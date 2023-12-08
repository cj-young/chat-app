"use client";
import FriendItem from "../FriendItem";
import styles from "./styles.module.scss";

import { useAuthContext } from "@/contexts/AuthContext";

export default function AllFriends() {
  const { friends } = useAuthContext();

  return (
    <div className={styles["all-friends"]}>
      <h2 className={styles["title"]}>All Friends</h2>
      {friends.length > 0 ? (
        <ul className={styles["friends-list"]}>
          {friends.map((friend) => (
            <FriendItem user={friend} key={friend.username} />
          ))}
        </ul>
      ) : (
        <p className={styles["no-friends"]}>Your friends will appear here</p>
      )}
    </div>
  );
}
