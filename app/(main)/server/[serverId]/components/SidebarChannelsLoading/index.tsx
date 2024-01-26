"use client";
import LoaderChannelGroup from "../LoaderChannelGroup";
import styles from "./styles.module.scss";

export default function SidebarChannelsLoading() {
  return (
    <div className={styles["container"]}>
      <LoaderChannelGroup channelCount={2} />
      <LoaderChannelGroup channelCount={3} />
      <LoaderChannelGroup channelCount={1} />
      <LoaderChannelGroup channelCount={4} />
    </div>
  );
}
