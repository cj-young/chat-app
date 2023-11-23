"use client";
import Link from "next/link";
import styles from "../styles.module.scss";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getGoogleOAuthUrl } from "@/lib/googleAuth";

interface Props {
  goToSecondStage(): void;
}

export default function SignUpForm({ goToSecondStage }: Props) {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    try {
      e.preventDefault();

      setError("");

      const response = await apiFetch("/auth/signup", "POST", {
        password,
        confirmPassword,
        email
      });

      const data = await response.json();

      if (!response.ok && data.message) {
        return setError(data.message);
      }

      goToSecondStage();
    } catch (error) {
      setError("An error occurred while signing up");
    }
  }

  function checkMatchingPasswords() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }

  async function signUpWithGoogle() {
    router.push(getGoogleOAuthUrl());
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
      <button
        className={styles.google}
        type="button"
        onClick={signUpWithGoogle}
      >
        <GoogleLogo alt="Google Logo" />
        <span>Continue with Google</span>
      </button>
      <span className={styles["log-in"]}>
        Already have an account? <Link href={"/login"}>Log In</Link>
      </span>
    </form>
  );
}
