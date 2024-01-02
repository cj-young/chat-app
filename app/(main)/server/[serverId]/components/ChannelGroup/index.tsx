"use client";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import CaretIcon from "@/public/caret-down-solid.svg";
import PlusSymbol from "@/public/plus-solid.svg";
import { IClientChannelGroup } from "@/types/server";
import { useMemo, useState } from "react";
import AddChannelModal from "../AddChannelModal";
import ChannelItem from "../ChannelItem";
import styles from "./styles.module.scss";

interface Props {
  channelGroup: IClientChannelGroup;
}

export default function ChannelGroup({
  channelGroup: { name, channels, id: groupId }
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { addModal } = useUiContext();
  const { serverInfo, role } = useServer();

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
        {(role === "owner" || role === "admin") && isExpanded && (
          <li className={styles["add-channel-container"]}>
            <button
              className={styles["add-channel"]}
              onClick={() =>
                addModal(
                  <AddChannelModal
                    groupName={name}
                    groupId={groupId}
                    serverId={serverInfo.serverId}
                  />
                )
              }
            >
              <PlusSymbol />
              <span>Add channel</span>
            </button>
          </li>
        )}
      </ul>
    </li>
  );
}
