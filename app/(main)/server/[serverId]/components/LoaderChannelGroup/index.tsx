"use client";
import styles from "./styles.module.scss";

interface Props {
  channelCount: number;
}

export default function LoaderChannelGroup({ channelCount }: Props) {
  return (
    <div className={styles["channel-group"]}>
      <div className={styles["group-name"]}></div>
      <div className={styles["channel-list"]}>
        {Array.from({ length: channelCount < 0 ? 1 : channelCount }, (_, i) => (
          <div className={styles["channel"]} key={i}></div>
        ))}
      </div>
    </div>
  );
}
