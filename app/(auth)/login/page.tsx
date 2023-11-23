"use client";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Link from "next/link";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getGoogleOAuthUrl } from "@/lib/googleAuth";

export default function Login() {
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  async function logIn() {
    try {
      const res = await apiFetch("/auth/login", "POST", {
        identifier,
        password
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          setError(data.message);
        } catch (error) {
          setError("An error occurred, please try again");
        } finally {
          return false;
        }
      }

      const data = await res.json();
      return true;
    } catch (error) {
      setError("An error occurred, please try again");
      throw error;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const loginSuccess = await logIn();
    if (loginSuccess) {
      router.push("/");
    }
  }

  async function logInWithGoogle() {
    router.push(getGoogleOAuthUrl());
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
        <button
          className={styles.google}
          type="button"
          onClick={logInWithGoogle}
        >
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
