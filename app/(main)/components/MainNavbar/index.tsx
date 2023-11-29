"use client";
import { useUiContext } from "@/contexts/UiContext";
import styles from "./styles.module.scss";

export default function MainNavbar() {
  const { mobileNavExpanded } = useUiContext();

  return (
    <nav
      className={[
        styles["nav"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    ></nav>
  );
}
