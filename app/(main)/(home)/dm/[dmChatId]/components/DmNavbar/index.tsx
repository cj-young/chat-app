"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuthContext } from "@/contexts/AuthContext";
import { IClientDm } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  directMessageChat: IClientDm;
}

export default function DmNavbar({ directMessageChat }: Props) {
  const { signOut } = useAuthContext();

  return (
    <div className={styles["nav-container"]}>
      <MobileNavToggle />
      <div className={styles["dm-user"]}>
        <ProfilePicture user={directMessageChat.user} />
        <h1 className={styles["dm-name"]}>
          {directMessageChat.user.displayName}
        </h1>
      </div>
      <nav></nav>
      <button onClick={signOut} className={styles["sign-out-button"]}>
        Sign Out
      </button>
    </div>
  );
}
