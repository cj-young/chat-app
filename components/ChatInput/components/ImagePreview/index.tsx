import TrashIcon from "@/public/trash-solid.svg";
import styles from "./styles.module.scss";

interface Props {
  remove(): void;
  imageUrl: string;
}

export default function ImagePreview({ imageUrl, remove }: Props) {
  return (
    <li className={styles["preview-container"]}>
      <img src={imageUrl} className={styles["image"]} />
      <button className={styles["remove-button"]} onClick={remove}>
        <TrashIcon />
      </button>
    </li>
  );
}
