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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DemoAccountPopup, {
  DemoAccountInfo
} from "./components/DemoAccountPopup";
import styles from "./page.module.scss";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoAccountInfo, setDemoAccountInfo] = useState<DemoAccountInfo>({
    username: null,
    password: null
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
    setValue,
    trigger
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema)
  });
  const identifierRegister = register("identifier");
  const passwordRegister = register("password");

  const fieldNames = new Set(["identifier", "password"]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setTimeout(() => {
      setDemoAccountInfo({
        username: searchParams.get("demoUsername"),
        password: searchParams.get("demoPassword")
      });
    }, 500);
  }, []);

  async function applyDemoInfo() {
    setValue("identifier", demoAccountInfo.username ?? "");
    setValue("password", demoAccountInfo.password ?? "");
    const isValid = await trigger();

    if (isValid) {
      handleSubmit(submitData)();
    }
  }

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
      <DemoAccountPopup
        username={demoAccountInfo.username}
        password={demoAccountInfo.password}
        onApply={applyDemoInfo}
      />
      <h1>Log In</h1>

      <form
        className={styles["login-form"]}
        onSubmit={handleSubmit(submitData)}
        // gets around TS's lack of inert propery support
        {...{ inert: loading ? "" : undefined }}
      >
        <Input
          type="text"
          placeholder="Username or email"
          name={identifierRegister.name}
          onChange={identifierRegister.onChange}
          onBlur={identifierRegister.onBlur}
          inputRef={identifierRegister.ref}
          error={errors.identifier?.message}
          className={styles["input"]}
        />
        <Input
          type="password"
          placeholder="Password"
          name={passwordRegister.name}
          onChange={passwordRegister.onChange}
          onBlur={passwordRegister.onBlur}
          inputRef={passwordRegister.ref}
          error={errors.password?.message}
          className={styles["input"]}
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
          Don&apos;t have an account? <Link href={"/signup"}>Sign Up</Link>
        </span>
      </form>
    </div>
  );
}
