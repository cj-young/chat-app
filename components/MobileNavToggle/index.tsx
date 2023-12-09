"use client";
import { useUiContext } from "@/contexts/UiContext";
import HamburgerIcon from "@/public/bars-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import styles from "./styles.module.scss";

export default function MobileNavToggle() {
  const { mobileNavExpanded, toggleMobileNav } = useUiContext();

  return (
    <button className={styles["button"]} onClick={toggleMobileNav}>
      {mobileNavExpanded ? <XIcon /> : <HamburgerIcon />}
    </button>
  );
}
