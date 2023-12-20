"use client";
import ProfileCard from "@/app/(main)/(home)/components/Sidebar/components/ProfileCard";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import { useMemo } from "react";
import ChannelGroup from "../ChannelGroup";
import styles from "./styles.module.scss";

export default function ServerSidebar() {
  const { channelGroups } = useServer();
  const { mobileNavExpanded } = useUiContext();

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
      <nav className={styles["nav"]}>
        <ul className={styles["nav-list"]}>
          {sortedChannelGroups.map((group) => (
            <ChannelGroup
              name={group.name}
              channels={group.channels}
              key={group.uiOrder}
            />
          ))}
        </ul>
      </nav>
      <ProfileCard />
    </div>
  );
}
