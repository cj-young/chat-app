"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import { useAuthContext } from "@/contexts/AuthContext";
import { IClientGroupChat } from "@/types/user";
import styles from "./styles.module.scss";

interface Props {
  groupChat: IClientGroupChat;
}

export default function GcNavbar({ groupChat }: Props) {
  const { signOut } = useAuthContext();

  return (
    <div className={styles["nav-container"]}>
      <MobileNavToggle />
      <div className={styles["gc-info"]}>
        <img className={styles["gc-image"]} src={groupChat.imageUrl} />
        <h1 className={styles["gc-members"]}>
          {groupChat.members.map((member) => member.displayName).join(", ")}
        </h1>
      </div>
      <button onClick={signOut} className={styles["sign-out-button"]}>
        Sign Out
      </button>
    </div>
  );
}
