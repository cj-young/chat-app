"use client";
import ProfileCard from "@/app/(main)/(home)/components/Sidebar/components/ProfileCard";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import PlusSymbol from "@/public/plus-solid.svg";
import { useMemo } from "react";
import AddGroupModal from "../AddGroupModal";
import ChannelGroup from "../ChannelGroup";
import ServerCard from "../ServerCard";
import styles from "./styles.module.scss";

export default function ServerSidebar() {
  const { channelGroups, role, serverInfo } = useServer();
  const { mobileNavExpanded, addModal } = useUiContext();

  const sortedChannelGroups = useMemo(() => {
    return channelGroups.sort((a, b) => a.uiOrder - b.uiOrder);
  }, [channelGroups]);

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <ServerCard />
      <nav className={styles["nav"]}>
        <ul className={styles["nav-list"]}>
          {sortedChannelGroups.map((group) => (
            <ChannelGroup
              name={group.name}
              channels={group.channels}
              key={group.uiOrder}
              uiOrder={group.uiOrder}
            />
          ))}
          {(role === "admin" || role === "owner") && (
            <li className={styles["add-group-container"]}>
              <button
                className={styles["add-channel"]}
                onClick={() =>
                  addModal(<AddGroupModal serverId={serverInfo.serverId} />)
                }
              >
                <PlusSymbol />
                <span>Add new group</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
      <ProfileCard />
    </div>
  );
}
