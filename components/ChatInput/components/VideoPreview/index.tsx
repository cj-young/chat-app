import useVideoPreview from "@/hooks/useVideoPreview";
import PlayIcon from "@/public/circle-play-solid.svg";
import TrashIcon from "@/public/trash-solid.svg";
import styles from "./styles.module.scss";

interface Props {
  remove(): void;
  videoUrl: string;
}

export default function VideoPreview({ videoUrl, remove }: Props) {
  const canvasRef = useVideoPreview(videoUrl);

  return (
    <li className={styles["preview-container"]}>
      <canvas ref={canvasRef} className={styles["image"]} />
      <button className={styles["remove-button"]} onClick={remove}>
        <TrashIcon />
      </button>
      <PlayIcon className={styles["play-icon"]} />
    </li>
  );
}
