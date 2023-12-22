"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import { useAuthContext } from "@/contexts/AuthContext";
import TextChannelIcon from "@/public/align-left-solid.svg";
import ShowMembersIcon from "@/public/users-solid.svg";
import { IClientChannel } from "@/types/server";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
  toggleMembersShown(): void;
}

export default function ChannelNavbar({ channel, toggleMembersShown }: Props) {
  const { signOut } = useAuthContext();

  return (
    <div className={styles["nav-container"]}>
      <MobileNavToggle />
      <div className={styles["channel-info"]}>
        {channel.type === "text" ? <TextChannelIcon /> : <></>}
        <h1 className={styles["channel-name"]}>{channel.name}</h1>
      </div>
      <div className={styles["buttons"]}>
        <button className={styles["nav-button"]} onClick={toggleMembersShown}>
          <ShowMembersIcon />
        </button>
      </div>
      <button onClick={signOut} className={styles["sign-out-button"]}>
        Sign Out
      </button>
    </div>
  );
}
