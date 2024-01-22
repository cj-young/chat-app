"use client";
import VideoModal from "@/components/VideoModal";
import { useUiContext } from "@/contexts/UiContext";
import useVideoPreview from "@/hooks/useVideoPreview";
import PlayIcon from "@/public/circle-play-solid.svg";
import styles from "./styles.module.scss";

interface Props {
  videoUrl: string;
}

export default function MessageVideo({ videoUrl }: Props) {
  const canvasRef = useVideoPreview(videoUrl);
  const { addModal } = useUiContext();

  function handleClick() {
    addModal(<VideoModal videoUrl={videoUrl} />);
  }

  return (
    <li className={styles["preview-container"]} onClick={handleClick}>
      <canvas ref={canvasRef} className={styles["image"]} />
      <PlayIcon className={styles["play-icon"]} />
    </li>
  );
}
