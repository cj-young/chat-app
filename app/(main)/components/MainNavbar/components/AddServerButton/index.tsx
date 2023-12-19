import PlusIcon from "@/public/plus-solid.svg";
import styles from "./styles.module.scss";

export default function AddServerButton() {
  return (
    <button className={styles["add-server-button"]}>
      <PlusIcon />
    </button>
  );
}
