import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { DisplayNameInfo, displayNameSchema } from "@/lib/schema";
import XIcon from "@/public/xmark-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

export default function EditDisplayName() {
  const { closeModal } = useUiContext();
  const [value, setValue] = useState("");
  const { profile, setProfile } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError
  } = useForm<DisplayNameInfo>({
    resolver: zodResolver(displayNameSchema),
    defaultValues: {
      displayName: profile.displayName
    }
  });

  const displayNameRegister = register("displayName");

  async function submitData({ displayName }: DisplayNameInfo) {
    try {
      const res = await apiFetch("/user/display-name", "POST", {
        newDisplayName: displayName
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldError("displayName", {
          type: "custom",
          message:
            data.message ?? "An error occurred changing your display name"
        });
        return;
      }

      setProfile((prev) => ({
        ...prev,
        displayName
      }));
      closeModal();
      console.log(data);
    } catch (error) {
      console.error(error);
      setFieldError("displayName", {
        type: "custom",
        message: "An error occurred changing your display name"
      });
    }
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Edit Display Name</h2>
      <form onSubmit={handleSubmit(submitData)}>
        <div className={styles["input-container"]}>
          <Input
            type="text"
            placeholder="Display name"
            name={displayNameRegister.name}
            onChange={displayNameRegister.onChange}
            onBlur={displayNameRegister.onBlur}
            inputRef={displayNameRegister.ref}
            error={errors.displayName?.message}
          />
          <LoaderButton type="submit" loading={isSubmitting}>
            Save
          </LoaderButton>
        </div>
      </form>
    </div>
  );
}
