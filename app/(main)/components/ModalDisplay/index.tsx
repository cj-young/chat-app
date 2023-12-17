"use client";
import { useUiContext } from "@/contexts/UiContext";
import { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

export default function ModalDisplay() {
  const { modal, closeModal } = useUiContext();
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      if (!backdropRef.current) return;
      if (backdropRef.current === e.target) {
        closeModal();
      }
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("mousedown", onWindowClick);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onWindowClick);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  return modal ? (
    <div className={styles["modal-container"]} ref={backdropRef}>
      {modal}
    </div>
  ) : null;
}
