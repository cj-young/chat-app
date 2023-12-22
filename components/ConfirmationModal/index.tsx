"use client";
import { useUiContext } from "@/contexts/UiContext";
import XIcon from "@/public/xmark-solid.svg";
import { useState } from "react";
import LoaderButton from "../LoaderButton";
import styles from "./styles.module.scss";

interface Props {
  confirmCallback(): any;
  title: string;
  confirmMessage?: string;
  cancelMessage?: string;
}

export default function ConfirmationModal({
  confirmCallback,
  confirmMessage,
  cancelMessage,
  title
}: Props) {
  const { closeModal } = useUiContext();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    await confirmCallback();
    setIsLoading(false);
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>{title}</h2>
      <div className={styles["buttons"]}>
        <button
          className={[styles["cancel-button"], styles["button"]].join(" ")}
          onClick={closeModal}
        >
          {cancelMessage ?? "Cancel"}
        </button>
        <LoaderButton
          className={[styles["leave-button"], styles["button"]].join(" ")}
          onClick={handleClick}
          loading={isLoading}
        >
          {confirmMessage ?? "Yes, continue"}
        </LoaderButton>
      </div>
    </div>
  );
}
