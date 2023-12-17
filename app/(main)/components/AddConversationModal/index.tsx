"use client";
import LoaderButton from "@/components/LoaderButton";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import Checkbox from "@/public/check-solid.svg";
import { FormEvent, useState } from "react";
import styles from "./styles.module.scss";

export default function AddConversationModal() {
  const { friends } = useAuthContext();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleCheckboxChange(friendId: string) {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((prevFriendId) => prevFriendId !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  }

  return (
    <div className={styles["modal"]}>
      <h2>Add friends to new conversation</h2>
      <form onSubmit={handleSubmit}>
        <ul className={styles["friends-list"]}>
          {friends.map((friend) => (
            <li key={friend.id} className={styles["friend-item"]}>
              <label className={styles["friend-label"]}>
                <ProfilePicture user={friend} status={friend.onlineStatus} />
                <span className={styles["display-name"]}>
                  {friend.displayName}
                </span>
                <span className={styles["username"]}>{friend.username}</span>
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend.id)}
                  onChange={() => handleCheckboxChange(friend.id)}
                />
                <div
                  className={[
                    styles["checkbox"],
                    selectedFriends.includes(friend.id) ? styles["checked"] : ""
                  ].join(" ")}
                >
                  {selectedFriends.includes(friend.id) && <Checkbox />}
                </div>
              </label>
            </li>
          ))}
        </ul>
        <LoaderButton
          type="submit"
          className={styles["create-button"]}
          loading={isLoading}
        >
          Create conversation
        </LoaderButton>
      </form>
    </div>
  );
}
