"use client";
import ImageInput from "@/components/ImageInput";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { useUiContext } from "@/contexts/UiContext";
import XIcon from "@/public/xmark-solid.svg";
import { FormEvent, useCallback, useState } from "react";
import styles from "./styles.module.scss";

export default function CreateServerModal() {
  const { closeModal } = useUiContext();
  const [serverImage, setServerImage] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverName, setServerName] = useState("");

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    setServerImage(acceptedFiles[0]);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (serverImage) formData.set("serverImage", serverImage);
      formData.set("serverName", serverName);
      const res = await fetch("/api/server/create", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2>Create a server</h2>
      <form className={styles["form"]} onSubmit={handleSubmit}>
        <ImageInput
          onDrop={onImageDrop}
          activeImage={serverImage}
          message="Click here or drag and drop to add an icon for your server"
        />
        <div className={styles["right-side"]}>
          <Input
            type="text"
            placeholder="Your server's name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
          <LoaderButton className={styles["create-server"]} loading={isLoading}>
            Create
          </LoaderButton>
        </div>
      </form>
    </div>
  );
}
