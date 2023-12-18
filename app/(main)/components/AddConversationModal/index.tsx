"use client";
import LoaderButton from "@/components/LoaderButton";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import Checkbox from "@/public/check-solid.svg";
import ErrorIcon from "@/public/triangle-exclamation-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./styles.module.scss";

export default function AddConversationModal() {
  const { friends } = useAuthContext();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const { closeModal } = useUiContext();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch("/group-chat/create", "POST", {
        groupChatUsers: selectedFriends
      });
      const data = await res.json();

      if (!res.ok) {
        return setFormError(
          data.message ?? "An error occurred, please try again"
        );
      }

      closeModal();
      router.push(`/gc/${data.chatId}`);
    } catch (error) {
      setIsLoading(false);
      setFormError("An error occurred, please try again");
    }
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
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Add friends to new conversation</h2>
      {friends.length > 0 ? (
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
                      selectedFriends.includes(friend.id)
                        ? styles["checked"]
                        : ""
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
          {formError && (
            <div className={styles["form-error"]}>
              <ErrorIcon />
              <span>{formError}</span>
            </div>
          )}
        </form>
      ) : (
        <p className={styles["no-friends"]}>
          You don't have any friends to add to a conversation
        </p>
      )}
    </div>
  );
}
