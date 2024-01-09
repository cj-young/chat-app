"use client";
import MobileNavToggle from "@/components/MobileNavToggle";
import styles from "./page.module.scss";

export default function ProfileSettings() {
  return (
    <>
      <div className={styles["title"]}>
        <MobileNavToggle />
        <h2>Profile</h2>
      </div>
    </>
  );
}
