"use client";
import styles from "./styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { signOut } from "next-auth/react";
import { useState } from "react";
import BackArrow from "@/public/left-long-solid.svg";

export default function CreateNameForm() {
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  async function goBack() {
    await signOut({ redirect: false });
  }

  return (
    <form className={styles["sign-up-form"]}>
      <button
        aria-label="back"
        type="button"
        onClick={goBack}
        className={styles.back}
      >
        <BackArrow alt="Go back" /> Back
      </button>
      <input
        type="text"
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <input
        type="password"
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
