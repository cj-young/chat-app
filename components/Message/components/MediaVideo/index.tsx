import useVideoPreview from "@/hooks/useVideoPreview";
import PlayIcon from "@/public/circle-play-solid.svg";
import styles from "./styles.module.scss";

interface Props {
  videoUrl: string;
}

export default function MessageVideo({ videoUrl }: Props) {
  const canvasRef = useVideoPreview(videoUrl);

  return (
    <li className={styles["preview-container"]}>
      <canvas ref={canvasRef} className={styles["image"]} />
      <PlayIcon className={styles["play-icon"]} />
    </li>
  );
}
