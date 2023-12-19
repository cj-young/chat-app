"use client";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import XIcon from "@/public/xmark-solid.svg";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./styles.module.scss";

interface Props {
  chatId: string;
}

export default function LeaveChatModal({ chatId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useUiContext();
  const router = useRouter();

  async function handleLeaveChat(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch(`/group-chat/leave/${chatId}`, "POST");
      const data = await res.json();
      console.log(data);
      closeModal();
      // router.push("/");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>
        Are you sure you want to leave this chat?
      </h2>
      <div className={styles["buttons"]}>
        <button
          className={[styles["cancel-button"], styles["button"]].join(" ")}
          onClick={closeModal}
        >
          No, cancel
        </button>
        <button
          className={[styles["leave-button"], styles["button"]].join(" ")}
          onClick={handleLeaveChat}
        >
          Yes, leave
        </button>
      </div>
    </div>
  );
}
