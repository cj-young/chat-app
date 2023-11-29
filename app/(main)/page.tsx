"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import FriendsNavbar from "./components/FriendsNavbar";
import styles from "./page.module.scss";

export default function Home() {
  const { profile } = useAuthContext();
  const { mobileNavExpanded } = useUiContext();

  return (
    <main
      className={[
        styles["main"],
        mobileNavExpanded ? styles["hidden"] : ""
      ].join(" ")}
    >
      <FriendsNavbar />
    </main>
  );
}
