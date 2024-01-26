import SendIcon from "@/public/paper-plane-solid.svg";
import styles from "./styles.module.scss";

export default function LoaderInput() {
  return (
    <div className={styles["input-form"]}>
      <div className={styles["input-container"]}>
        <div className={styles["input"]}>&nbsp;</div>
      </div>
      <button className={styles["send-button"]}>
        <SendIcon />
      </button>
    </div>
  );
}
