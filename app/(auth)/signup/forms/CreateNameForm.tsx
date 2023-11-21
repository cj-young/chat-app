"use client";
import styles from "../styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { FormEvent, useState } from "react";
import BackArrow from "@/public/left-long-solid.svg";
import { createName } from "../actions";

export default function CreateNameForm() {
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  async function goBack() {}

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const res = await createName({ displayName, username });
    console.log(res);
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
      <input
        type="text"
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <input
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
