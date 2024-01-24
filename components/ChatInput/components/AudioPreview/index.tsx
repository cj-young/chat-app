import AudioPlayer from "@/components/AudioPlayer";
import TrashIcon from "@/public/trash-solid.svg";
import styles from "./styles.module.scss";

interface Props {
  audioUrl: string;
  remove(): void;
}

export default function AudioPreview({ audioUrl, remove }: Props) {
  return (
    <div className={styles["audio-preview"]}>
      <AudioPlayer url={audioUrl} />
      <button className={styles["remove-button"]} onClick={remove}>
        <TrashIcon />
      </button>
    </div>
  );
}
