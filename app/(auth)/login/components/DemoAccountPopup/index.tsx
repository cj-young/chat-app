"use client";
import { useState } from "react";
import styles from "./styles.module.scss";

export type DemoAccountInfo = {
  username: string | null;
  password: string | null;
};

interface Props {
  username: string | null;
  password: string | null;
  onApply(): void;
}

export default function DemoAccountPopup({
  username,
  password,
  onApply
}: Props) {
  const [isApplied, setIsApplied] = useState(false);
  const isShown = !!(username && password) && !isApplied;

  function handleApply() {
    setIsApplied(true);
    onApply();
  }

  return (
    <div
      className={styles["popup"]}
      style={{
        opacity: isShown ? 1 : 0,
        pointerEvents: isShown ? "auto" : "none"
      }}
      aria-hidden={!isShown}
    >
      <button className={styles["apply-button"]} onClick={handleApply}>
        Click here
      </button>
      to sign in with a demo account
    </div>
  );
}
