"use client";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import CopyIcon from "@/public/copy-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface Props {
  serverId: string;
}

export default function InviteModal({ serverId }: Props) {
  const { closeModal } = useUiContext();
  const [inviteLink, setInviteLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/server/invite/${serverId}`);
        const data = await res.json();

        if (!res.ok) {
          return console.error(data.message);
        }

        setInviteLink(data.inviteLink);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Send invite link</h2>
      <p className={styles["description"]}>
        Copy this invite link and send it to a friend
      </p>
      <div className={styles["link-container"]}>
        {inviteLink ? (
          <>
            <Input
              type="text"
              readOnly
              value={inviteLink}
              className={styles["link-input"]}
            />
            <button className={styles["copy-button"]} onClick={handleCopy}>
              <CopyIcon />
            </button>
          </>
        ) : (
          <Loader />
        )}
      </div>
      {isCopied && (
        <span className={styles["copied-message"]}>Copied to clipboard!</span>
      )}
    </div>
  );
}
