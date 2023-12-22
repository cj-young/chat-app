"use client";
import { useUiContext } from "@/contexts/UiContext";
import XIcon from "@/public/xmark-solid.svg";
import LoaderButton from "../LoaderButton";
import styles from "./styles.module.scss";

interface Props {
  confirmCallback(): any;
  loading?: boolean;
  title: string;
  confirmMessage?: string;
  cancelMessage?: string;
}

export default function ConfirmationModal({
  confirmCallback,
  loading = false,
  confirmMessage,
  cancelMessage,
  title
}: Props) {
  const { closeModal } = useUiContext();

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
          onClick={() => confirmCallback()}
          loading={loading}
        >
          {confirmMessage ?? "Yes, continue"}
        </LoaderButton>
      </div>
    </div>
  );
}
