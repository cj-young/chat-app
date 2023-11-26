"use client";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { apiFetch } from "@/lib/api";
import { getGoogleOAuthUrl } from "@/lib/googleAuth";
import { LoginCredentials, loginSchema } from "@/lib/schema";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema)
  });
  const identifierRegister = register("identifier");
  const passwordRegister = register("password");

  const fieldNames = new Set(["identifier", "password"]);

  const router = useRouter();

  async function logIn({ identifier, password }: LoginCredentials) {
    try {
      const res = await apiFetch("/auth/login", "POST", {
        identifier,
        password
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field && fieldNames.has(data.field)) {
          return setFieldError(data.field, {
            type: "custom",
            message: data.message
          });
        } else if (data.message) {
          setError(data.message);
          return false;
        } else {
          setError("An error occurred while signing up");
          return false;
        }
      }

      return true;
    } catch (error) {
      setError("An error occurred, please try again");
      throw error;
    }
  }

  async function submitData(data: LoginCredentials) {
    setLoading(true);
    const loginSuccess = await logIn(data);
    if (loginSuccess) {
      router.push("/");
    } else {
      setLoading(false);
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
        aria-disabled={loading}
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
        <LoaderButton
          loading={loading}
          type="submit"
          className={styles["submit-button"]}
          disabled={loading}
        >
          Log In
        </LoaderButton>
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
