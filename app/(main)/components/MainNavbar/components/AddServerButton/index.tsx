"use client";
import { useUiContext } from "@/contexts/UiContext";
import PlusIcon from "@/public/plus-solid.svg";
import CreateServerModal from "../CreateServerModal";
import styles from "./styles.module.scss";

export default function AddServerButton() {
  const { addModal } = useUiContext();

  function handleClick() {
    addModal(<CreateServerModal />);
  }

  return (
    <button className={styles["add-server-button"]} onClick={handleClick}>
      <PlusIcon />
    </button>
  );
}
