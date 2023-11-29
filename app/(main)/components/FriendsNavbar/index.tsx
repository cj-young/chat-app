import Plus from "@/public/plus-solid.svg";
import styles from "./styles.module.scss";

export default function FriendsNavbar() {
  return (
    <div className={styles["nav-container"]}>
      <h1 className={styles["title"]}>Friends</h1>
      <nav>
        <ul className={styles["nav-items"]}>
          <li className={styles["nav-link"]}>
            <button>Online</button>
          </li>
          <li className={styles["nav-link"]}>
            <button>All</button>
          </li>
          <li className={styles["nav-link"]}>
            <button>Pending</button>
          </li>
          <li className={styles["nav-link"]}>
            <button>Blocked</button>
          </li>
          <li className={styles["nav-link"]}>
            <button className={styles["add-friend"]}>
              Add <Plus />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
