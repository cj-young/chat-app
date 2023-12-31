import { useUiContext } from "@/contexts/UiContext";
import XIcon from "@/public/xmark-solid.svg";
import styles from "./styles.module.scss";

interface Props {
  title?: string;
  message?: string;
}

export default function MessageModal({ title, message }: Props) {
  const { closeModal } = useUiContext();

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      {title && <h2 className={styles["title"]}>{title}</h2>}
      {message && <p className={styles["message"]}>{message}</p>}
    </div>
  );
}
