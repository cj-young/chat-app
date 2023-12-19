"use client";
import { useUiContext } from "@/contexts/UiContext";
import AddServerButton from "./components/AddServerButton";
import HomeButton from "./components/HomeButton";
import styles from "./styles.module.scss";

export default function MainNavbar() {
  const { mobileNavExpanded } = useUiContext();

  return (
    <nav
      className={[
        styles["nav"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <ul className={styles["nav-list"]}>
        <li className={styles["nav-item"]}>
          <HomeButton />
        </li>
        <li className={styles["nav-item"]}>
          <AddServerButton />
        </li>
      </ul>
    </nav>
  );
}
