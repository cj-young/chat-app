"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import { useAuthContext } from "@/contexts/AuthContext";
import TextChannelIcon from "@/public/align-left-solid.svg";
import { IClientChannel } from "@/types/server";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
}

export default function ChannelNavbar({ channel }: Props) {
  const { signOut } = useAuthContext();

  return (
    <div className={styles["nav-container"]}>
      <MobileNavToggle />
      <div className={styles["channel-info"]}>
        {channel.type === "text" ? <TextChannelIcon /> : <></>}
        <h1 className={styles["channel-name"]}>{channel.name}</h1>
      </div>
      <button onClick={signOut} className={styles["sign-out-button"]}>
        Sign Out
      </button>
    </div>
  );
}
