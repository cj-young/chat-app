"use client";

import styles from "./styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { useState } from "react";

export default function CreateNameForm() {
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  return (
    <form className={styles["sign-up-form"]}>
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
