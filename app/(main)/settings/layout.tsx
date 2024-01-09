"use client";
import { useUiContext } from "@/contexts/UiContext";
import { ReactNode } from "react";
import SettingsNavbar from "./components/SettingsNavbar";
import styles from "./layout.module.scss";

interface Props {
  children: ReactNode;
}

export default function SettingsLayout({ children }: Props) {
  const { mobileNavExpanded } = useUiContext();

  return (
    <div className={styles["settings"]}>
      <SettingsNavbar />
      <main
        className={[
          styles["main-settings"],
          mobileNavExpanded ? styles["hidden"] : ""
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}
