"use client";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import Link from "next/link";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getGoogleOAuthUrl } from "@/lib/googleAuth";
import Input from "@/components/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginCredentials, loginSchema } from "@/lib/schema";

export default function Login() {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema)
  });
  const identifierRegister = register("identifier");
  const passwordRegister = register("password");

  const router = useRouter();

  async function logIn({ identifier, password }: LoginCredentials) {
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

  async function submitData(data: LoginCredentials) {
    console.log(data);
    const loginSuccess = await logIn(data);
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

      <form
        className={styles["login-form"]}
        onSubmit={handleSubmit(submitData)}
      >
        <Input
          type="text"
          placeholder="Username or email"
          name={identifierRegister.name}
          onChange={identifierRegister.onChange}
          onBlur={identifierRegister.onBlur}
          inputRef={identifierRegister.ref}
          error={errors.identifier?.message}
        />
        <Input
          type="password"
          placeholder="Password"
          name={passwordRegister.name}
          onChange={passwordRegister.onChange}
          onBlur={passwordRegister.onBlur}
          inputRef={passwordRegister.ref}
          error={errors.password?.message}
        />
        {error && (
          <div className={styles.error}>
            <ErrorSymbol />
            <span>{error}</span>
          </div>
        )}
        <button type="submit" className={styles["submit-button"]}>
          Log In
        </button>
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
