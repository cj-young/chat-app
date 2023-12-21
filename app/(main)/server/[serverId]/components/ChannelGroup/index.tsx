"use client";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import CaretIcon from "@/public/caret-down-solid.svg";
import PlusSymbol from "@/public/plus-solid.svg";
import { IClientChannel } from "@/types/server";
import { useMemo, useState } from "react";
import AddChannelModal from "../AddChannelModal";
import ChannelItem from "../ChannelItem";
import styles from "./styles.module.scss";

interface Props {
  name: string;
  channels: IClientChannel[];
  uiOrder: number;
}

export default function ChannelGroup({ name, channels, uiOrder }: Props) {
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
      {(role === "owner" || role === "admin") && isExpanded && (
        <ul className={styles["channel-list"]}>
          {sortedChannels.map((channel) => (
            <ChannelItem channel={channel} key={channel.channelId} />
          ))}
          {
            <li className={styles["add-channel-container"]}>
              <button
                className={styles["add-channel"]}
                onClick={() =>
                  addModal(
                    <AddChannelModal
                      groupName={name}
                      groupOrder={uiOrder}
                      serverId={serverInfo.serverId}
                    />
                  )
                }
              >
                <PlusSymbol />
                <span>Add channel</span>
              </button>
            </li>
          }
        </ul>
      )}
    </li>
  );
}
