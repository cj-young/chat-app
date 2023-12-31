"use client";
import LoaderButton from "@/components/LoaderButton";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import Checkbox from "@/public/check-solid.svg";
import ErrorIcon from "@/public/triangle-exclamation-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { IProfile } from "@/types/user";
import { FormEvent, useMemo, useState } from "react";
import styles from "./styles.module.scss";

interface Props {
  alreadyInChat: IProfile[];
  chatId: string;
}

export default function AddUserModal({ alreadyInChat, chatId }: Props) {
  const { friends } = useAuthContext();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { closeModal } = useUiContext();

  const friendsNotInChat = useMemo(() => {
    const alreadyInChatSet = new Set(alreadyInChat.map((user) => user.id));
    return friends.filter((friend) => !alreadyInChatSet.has(friend.id));
  }, [friends]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch(`/group-chat/add-users/${chatId}`, "POST", {
        userIds: selectedFriends
      });
      const data = await res.json();

      if (!res.ok) {
        return setFormError(
          data.message ?? "An error occurred, please try again"
        );
      }
      closeModal();
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
      <h2 className={styles["title"]}>Add friends to this conversation</h2>
      {friendsNotInChat.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <ul className={styles["friends-list"]}>
            {friendsNotInChat.map((friend) => (
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
            Add friends
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
          You don't have any more friends to add to this conversation
        </p>
      )}
    </div>
  );
}
