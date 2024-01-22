import { useUiContext } from "@/contexts/UiContext";
import XIcon from "@/public/xmark-solid.svg";
import ReactPlayer from "react-player";
import styles from "./styles.module.scss";

interface Props {
  videoUrl: string;
}

export default function VideoModal({ videoUrl }: Props) {
  const { closeModal } = useUiContext();

  return (
    <div className={styles["video-modal"]}>
      <ReactPlayer
        url={videoUrl}
        controls={true}
        className={styles["video-player"]}
        width="100%"
        height="100%"
      />
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
    </div>
  );
}
