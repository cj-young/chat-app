"use client";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { apiFetch } from "@/lib/api";
import { FormEvent, useState } from "react";
import styles from "./styles.module.scss";

export default function AddFriend() {
  const [receiver, setReceiver] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);
    try {
      const res = await apiFetch("/friends/add", "POST", {
        receiverUsername: receiver
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message ?? "An error occurred, please try again");
      }

      setSuccessMessage(data.message);
    } catch (error) {
      setFormError("An error occurred, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles["add-friend"]}>
      <h2 className={styles["title"]}>Add Friend</h2>
      <form className={styles["form"]} onSubmit={handleSubmit}>
        <Input
          type="text"
          className={styles["input"]}
          placeholder="Add friend by username"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          error={formError}
          successMessage={successMessage}
        />
        <LoaderButton loading={isLoading}>Add Friend</LoaderButton>
      </form>
    </div>
  );
}
