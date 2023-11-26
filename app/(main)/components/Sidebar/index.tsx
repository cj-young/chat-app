import styles from "./styles.module.scss";

export default function Sidebar() {
  return (
    <div className={[styles["sidebar"], styles["hidden"]].join(" ")}></div>
  );
}
