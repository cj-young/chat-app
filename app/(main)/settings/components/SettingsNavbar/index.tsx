"use client";
import { useUiContext } from "@/contexts/UiContext";
import NavbarItem from "../NavbarItem";
import styles from "./styles.module.scss";

export default function SettingsNavbar() {
  const { mobileNavExpanded } = useUiContext();

  return (
    <nav
      className={[
        styles["nav"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <h1>Settings</h1>
      <ul className={styles["nav-list"]}>
        <NavbarItem name="Profile" path="profile" />
      </ul>
    </nav>
  );
}
