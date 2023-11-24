"use client";
import styles from "../styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { FormEvent, useState } from "react";
import BackArrow from "@/public/left-long-solid.svg";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";

interface Props {
  goToFirstStage(): void;
}

export default function CreateNameForm({ goToFirstStage }: Props) {
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  async function goBack() {
    goToFirstStage();
    apiFetch("/auth/sign-out", "POST");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await apiFetch("/auth/create-name", "POST", {
        displayName,
        username
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "An error occurred, please try again");
      }

      router.push("/");
    } catch (error) {
      setError("An error occurred, please try again");
    }
  }

  return (
    <form className={styles["sign-up-form"]} onSubmit={handleSubmit}>
      <button
        aria-label="back"
        type="button"
        onClick={goBack}
        className={styles.back}
      >
        <BackArrow alt="Go back" /> Back
      </button>
      <Input
        type="text"
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Username (unique)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && (
        <div className={styles.error}>
          <ErrorSymbol />
          <span>{error}</span>
        </div>
      )}
      <button type="submit">Sumbit</button>
    </form>
  );
}
