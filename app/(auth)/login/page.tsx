"use client";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Link from "next/link";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { apiFetch } from "@/lib/api";

export default function Login() {
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await apiFetch("/auth/login", "POST", { identifier, password });

    if (!res.ok) {
      try {
        const data = await res.json();
        setError(data.message);
      } catch (error) {
        setError("An error occurred, please try again");
      } finally {
        return;
      }
    }

    const data = await res.json();
  }

  return (
    <div className={styles.login}>
      <h1>Log In</h1>

      <form className={styles["login-form"]} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className={styles.error}>
            <ErrorSymbol />
            <span>{error}</span>
          </div>
        )}
        <button type="submit">Log In</button>
        <div className={styles.divider}></div>
        <button className={styles.google} type="button">
          <GoogleLogo alt="Google Logo" />
          <span>Log in with Google</span>
        </button>
        <span className={styles["sign-up"]}>
          Don't have an account? <Link href={"/signup"}>Sign Up</Link>
        </span>
      </form>
    </div>
  );
}
