import { TMessageMedia } from "@/types/message";
import styles from "./styles.module.scss";

interface Props {
  image: TMessageMedia;
}

export default function MessageImage({ image }: Props) {
  return (
    <li className={styles["image-container"]}>
      <img src={image.mediaUrl} className={styles["image"]} />
    </li>
  );
}
