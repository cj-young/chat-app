import TextChannelIcon from "@/public/align-left-solid.svg";
import { IClientChannel } from "@/types/server";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
}

export default function ServerChannelBanner({ channel }: Props) {
  return (
    <div className={styles["banner"]}>
      <div className={styles["banner-image-container"]}>
        {channel.type === "text" ? <TextChannelIcon /> : <></>}
      </div>
      <span className={styles["channel-name"]}>{channel.name}</span>
      <span className={styles["beginning-message"]}>
        This is the beginning of <b>{channel.name}</b>
      </span>
    </div>
  );
}
