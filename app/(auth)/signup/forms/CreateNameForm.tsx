"use client";
import styles from "../styles.module.scss";
import ErrorSymbol from "@/public/triangle-exclamation-solid.svg";
import { FormEvent, useState } from "react";
import BackArrow from "@/public/left-long-solid.svg";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import { CreateNameInfo, createNameSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LoaderButton from "@/components/LoaderButton";

interface Props {
  goToFirstStage(): void;
}

export default function CreateNameForm({ goToFirstStage }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError
  } = useForm<CreateNameInfo>({
    resolver: zodResolver(createNameSchema)
  });

  const usernameRegister = register("username");
  const displayNameRegister = register("displayName");

  const fieldNames = new Set(["username", "displayName"]);

  async function goBack() {
    goToFirstStage();
    await apiFetch("/auth/sign-out", "POST");
  }

  async function submitData({ displayName, username }: CreateNameInfo) {
    try {
      setLoading(true);
      const res = await apiFetch("/auth/create-name", "POST", {
        displayName,
        username
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

      router.push("/");
    } catch (error) {
      setError("An error occurred, please try again");
    }
  }

  return (
    <form
      className={styles["sign-up-form"]}
      onSubmit={handleSubmit(submitData)}
    >
      <button
        aria-label="back"
        type="button"
        onClick={goBack}
        className={styles.back}
      >
        <BackArrow alt="Go back" /> Back
      </button>
      <Input
        type="text"
        placeholder="Display name"
        name={displayNameRegister.name}
        onChange={displayNameRegister.onChange}
        onBlur={displayNameRegister.onBlur}
        inputRef={displayNameRegister.ref}
        error={errors.displayName?.message}
        className={styles["first-input"]}
      />
      <Input
        type="text"
        placeholder="Username (unique)"
        name={usernameRegister.name}
        onChange={usernameRegister.onChange}
        onBlur={usernameRegister.onBlur}
        inputRef={usernameRegister.ref}
        error={errors.username?.message}
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
        Sumbit
      </LoaderButton>
    </form>
  );
}
