"use client";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import CheckIcon from "@/public/check-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { IProfile } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  user: IProfile;
}

export default function FriendRequest({ user }: Props) {
  const { fulfillFriendRequest } = useAuthContext();

  async function handleAccept() {
    await fulfillFriendRequest(user.id, "accept");
  }

  async function handleDecline() {
    await fulfillFriendRequest(user.id, "decline");
  }

  return (
    <div className={styles["friend-request"]}>
      <div className={styles["left"]}>
        <ProfilePicture user={user} />
        <div className={styles["names"]}>
          <span className={styles["display-name"]}>{user.displayName}</span>
          <span className={styles["username"]}>{user.username}</span>
        </div>
      </div>
      <div className={styles["right"]}>
        <button
          className={[styles["button"], styles["accept"]].join(" ")}
          aria-label="Accept friend request"
          onClick={handleAccept}
        >
          <CheckIcon />
        </button>
        <button
          className={[styles["button"], styles["decline"]].join(" ")}
          aria-label="Decline friend request"
          onClick={handleDecline}
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}
