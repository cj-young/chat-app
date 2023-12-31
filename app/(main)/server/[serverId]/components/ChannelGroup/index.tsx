"use client";
import CaretIcon from "@/public/caret-down-solid.svg";
import { IClientChannelGroup } from "@/types/server";
import { useMemo, useState } from "react";
import ChannelItem from "../ChannelItem";
import styles from "./styles.module.scss";

interface Props {
  channelGroup: IClientChannelGroup;
}

export default function ChannelGroup({
  channelGroup: { name, channels, id: groupId }
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sortedChannels = useMemo(() => {
    return channels.sort((a, b) => a.uiOrder - b.uiOrder);
  }, [channels]);

  function handleExpand() {
    setIsExpanded((prev) => !prev);
  }

  return (
    <li className={styles["channel-group"]}>
      <div className={styles["group-name-container"]} onClick={handleExpand}>
        <button
          className={[
            styles["toggle-shown"],
            isExpanded ? "" : styles["collapsed"]
          ].join(" ")}
        >
          <CaretIcon />
        </button>
        <h3 className={styles["group-name"]}>{name}</h3>
      </div>
      <ul className={styles["channel-list"]}>
        {isExpanded &&
          sortedChannels.map((channel) => (
            <ChannelItem channel={channel} key={channel.channelId} />
          ))}
      </ul>
    </li>
  );
}
