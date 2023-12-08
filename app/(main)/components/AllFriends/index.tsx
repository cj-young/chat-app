"use client";
import styles from "./styles.module.scss";

import { useAuthContext } from "@/contexts/AuthContext";

export default function AllFriends() {
  const { friends } = useAuthContext();

  return (
    <div className={styles["all-friends"]}>
      <h2 className={styles["title"]}>All Friends</h2>
    </div>
  );
}
