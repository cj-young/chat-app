import styles from "./not-found.module.scss";

export default function InviteNotFound() {
  return (
    <div className={styles["not-found"]}>
      <p className={styles["message"]}>That invite is invalid or has expired</p>
      <button className={styles["button"]}>
        <a href="/">Go Home</a>
      </button>
    </div>
  );
}
