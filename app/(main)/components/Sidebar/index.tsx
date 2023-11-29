"use client";
import { useUiContext } from "@/contexts/UiContext";
import styles from "./styles.module.scss";

export default function Sidebar() {
  const { mobileNavExpanded } = useUiContext();

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    ></div>
  );
}
