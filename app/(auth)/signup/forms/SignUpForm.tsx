"use client";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { apiFetch } from "@/lib/api";
import { getGoogleOAuthUrl } from "@/lib/googleAuth";
import { SignupCredentials, signupSchema } from "@/lib/schema";
import GoogleLogo from "@/public/google-logo.svg";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "../page.module.scss";

interface Props {
  goToSecondStage(): void;
}

export default function SignUpForm({ goToSecondStage }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError
  } = useForm<SignupCredentials>({
    resolver: zodResolver(signupSchema)
  });

  const emailRegister = register("email");
  const passwordRegister = register("password", {
    deps: ["confirmPassword"]
  });
  const confirmPasswordRegister = register("confirmPassword");
  const fieldNames = new Set(["email", "password", "confirmPassword"]);

  async function submitData({
    password,
    confirmPassword,
    email
  }: SignupCredentials) {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/auth/signup", "POST", {
        password,
        confirmPassword,
        email
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        if (data.field && fieldNames.has(data.field)) {
          return setFieldError(data.field, {
            type: "custom",
            message: data.message
          });
        } else if (data.message) {
          return setError(data.message);
        } else {
          return setError("An error occurred while signing up");
        }
      }

      goToSecondStage();
    } catch (error) {
      setError("An error occurred while signing up");
    }
  }
  async function signUpWithGoogle() {
    router.push(getGoogleOAuthUrl());
  }

  return (
    <form
      className={styles["sign-up-form"]}
      onSubmit={handleSubmit(submitData)}
    >
      <Input
        type="text"
        placeholder="Email"
        name={emailRegister.name}
        onChange={emailRegister.onChange}
        onBlur={emailRegister.onBlur}
        inputRef={emailRegister.ref}
        error={errors.email?.message}
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
      <Input
        type="password"
        placeholder="Confirm password"
        name={confirmPasswordRegister.name}
        onChange={confirmPasswordRegister.onChange}
        onBlur={confirmPasswordRegister.onBlur}
        inputRef={confirmPasswordRegister.ref}
        error={errors.confirmPassword?.message}
      />
      {error && (
        <div className={styles.error}>
          <ErrorSymbol />
          <span>{error}</span>
        </div>
      )}
      <LoaderButton
        type="submit"
        className={styles["submit-button"]}
        loading={loading}
      >
        Create Account
      </LoaderButton>
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
