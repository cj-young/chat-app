"use client";

import Link from "next/link";
import styles from "./styles.module.scss";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { useState } from "react";
import { signUp } from "./actions";
import { signIn } from "next-auth/react";

export default function SignUpForm() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await signUp({ email, password, confirmPassword });

    if (response.error) {
      return setError(response.error);
    }

    const loginRes = await signIn("credentials", {
      identifier: email,
      password,
      redirect: false
    });

    if (!loginRes?.ok) {
      return setError("An error occurred, please try again");
    }
  }

  function checkMatchingPasswords() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }

  return (
    <form className={styles["sign-up-form"]} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={checkMatchingPasswords}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={checkMatchingPasswords}
      />
      {error && (
        <div className={styles.error}>
          <ErrorSymbol />
          <span>{error}</span>
        </div>
      )}
      <button type="submit">Create Account</button>
      <div className={styles.divider}></div>
      <button className={styles.google} type="button">
        <GoogleLogo alt="Google Logo" />
        <span>Continue with Google</span>
      </button>
      <span className={styles["log-in"]}>
        Already have an account? <Link href={"/login"}>Log In</Link>
      </span>
    </form>
  );
}