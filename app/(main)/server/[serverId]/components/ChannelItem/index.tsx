"use client";
import TextChannelIcon from "@/public/align-left-solid.svg";
import { IClientChannel } from "@/types/server";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
}

export default function ChannelItem({ channel }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isBeingViewed = useMemo(() => {
    return pathname.endsWith(channel.channelId);
  }, [pathname]);

  function handleClick() {
    router.push(`/server/${channel.serverId}/${channel.channelId}`);
  }

  return (
    <li className={styles["channel-item"]}>
      <button
        className={[
          styles["channel-button"],
          isBeingViewed ? styles["selected"] : ""
        ].join(" ")}
        onClick={handleClick}
      >
        {channel.type === "text" ? <TextChannelIcon /> : <></>}
        <span className={styles["channel-name"]}>{channel.name}</span>
      </button>
    </li>
  );
}
