"use client";
import LoaderButton from "@/components/LoaderButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import CheckSymbol from "@/public/check-solid.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { IProfile } from "@/types/user";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ProfilePicture from "../..";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

type TButton = "message" | "removeFriend" | "addFriend" | "blockUser";

export default function ProfileModal({ user }: Props) {
  const { closeModal } = useUiContext();
  const { friends, profile, directMessages, blockedUsers, setBlockedUsers } =
    useAuthContext();
  const [loadingButton, setLoadingButton] = useState<TButton | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const isFriend = useMemo(() => {
    return friends.some((friend) => friend.id === user.id);
  }, [friends]);

  const isClientUser = useMemo(() => {
    return user.id === profile.id;
  }, [user]);

  const isBlocked = useMemo(() => {
    return blockedUsers.some((blockedUser) => blockedUser.id === user.id);
  }, [blockedUsers]);

  function resolveAsError(errorMessage?: string) {
    setErrorMessage(errorMessage ?? "An error occurred, please try again");
    setSuccessMessage("");
    setLoadingButton(null);
  }

  async function handleAddFriend() {
    try {
      setSuccessMessage("");
      setErrorMessage("");
      setLoadingButton("addFriend");
      const res = await apiFetch("/friends/add", "POST", {
        receiverId: user.id
      });
      const data = await res.json();
      if (!res.ok) {
        return resolveAsError(data.message);
      }

      setSuccessMessage("Friend request sent");
      setErrorMessage("");
      return setLoadingButton(null);
    } catch (error) {
      return resolveAsError();
    }
  }

  async function handleRemoveFriend() {
    try {
      setSuccessMessage("");
      setErrorMessage("");
      setLoadingButton("removeFriend");
      const res = await apiFetch("/friends/remove", "POST", {
        receiverId: user.id
      });
      const data = await res.json();
      if (!res.ok) {
        return resolveAsError(data.message);
      }

      setSuccessMessage("Friend removed");
      setErrorMessage("");
      return setLoadingButton(null);
    } catch (error) {
      return resolveAsError();
    }
  }

  async function handleMessageUser() {
    try {
      const existingDm = directMessages.find((dm) => dm.user.id == user.id);
      if (existingDm) {
        closeModal();
        return router.push(`/dm/${existingDm.chatId}`);
      }

      const res = await apiFetch("/dm/add-or-open", "POST", {
        receiverId: user.id
      });
      const data = await res.json();

      if (!res.ok || !data.chatId) {
        console.error(data.message);
      }

      closeModal();
      router.push(`/dm/${data.chatId}`);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleBlockUser() {
    try {
      const res = await apiFetch("/user/block", "POST", {
        blockedUserId: user.id
      });
      const data = await res.json();
      if (!res.ok) {
        return setErrorMessage(
          data.message ?? "An error occurred while blocking this user"
        );
      }

      if (data.user) {
        return setBlockedUsers((prev) => [
          ...prev.filter((prevUser) => prevUser.id !== data.user.id),
          data.user
        ]);
      }

      console.log(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while blocking this user");
    }
  }

  async function handleUnblockUser() {
    try {
      const res = await apiFetch("/user/unblock", "POST", {
        unblockedUserId: user.id
      });
      const data = await res.json();
      if (!res.ok) {
        return setErrorMessage(
          data.message ?? "An error occurred while unblocking this user"
        );
      }

      setBlockedUsers((prev) =>
        prev.filter((prevBlockedUser) => prevBlockedUser.id !== user.id)
      );

      console.log(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while unblocking this user");
    }
  }

  return (
    <div className={styles["profile-menu"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <div className={styles["top-section"]}>
        <ProfilePicture user={user} className={styles["profile-picture"]} />
        <div className={styles["names"]}>
          <h3 className={styles["display-name"]}>{user.displayName}</h3>
          <p className={styles["username"]}>@{user.username}</p>
        </div>
      </div>
      {!isClientUser && (
        <div className={styles["buttons"]}>
          <LoaderButton
            className={[styles["button"], styles["message-button"]].join(" ")}
            loading={loadingButton === "message"}
            onClick={handleMessageUser}
          >
            Message
          </LoaderButton>
          {isFriend ? (
            <LoaderButton
              className={[
                styles["button"],
                styles["remove-friend-button"]
              ].join(" ")}
              loading={loadingButton === "removeFriend"}
              onClick={handleRemoveFriend}
            >
              Remove Friend
            </LoaderButton>
          ) : (
            <LoaderButton
              className={[styles["button"], styles["add-friend-button"]].join(
                " "
              )}
              loading={loadingButton === "addFriend"}
              onClick={handleAddFriend}
            >
              Add Friend
            </LoaderButton>
          )}
          <LoaderButton
            className={[styles["button"], styles["block-user-button"]].join(
              " "
            )}
            loading={loadingButton === "blockUser"}
            onClick={isBlocked ? handleUnblockUser : handleBlockUser}
          >
            {isBlocked ? "Unblock User" : "Block User"}
          </LoaderButton>
        </div>
      )}
      {successMessage && (
        <div className={styles["success-message"]}>
          <CheckSymbol />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className={styles["error-message"]}>
          <ErrorSymbol />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
