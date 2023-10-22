"use client";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Link from "next/link";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";

export default function Login() {
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={styles.login}>
      <h1>Log In</h1>

      <form className={styles["login-form"]}>
        <input
          type="text"
          placeholder="Username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
