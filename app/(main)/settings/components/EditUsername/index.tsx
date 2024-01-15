import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { UsernameInfo, usernameSchema } from "@/lib/schema";
import XIcon from "@/public/xmark-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

export default function EditUsername() {
  const { closeModal } = useUiContext();
  const { profile, setProfile } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError
  } = useForm<UsernameInfo>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: profile.username
    }
  });

  const usernameRegister = register("username");

  async function submitData({ username }: UsernameInfo) {
    try {
      const res = await apiFetch("/user/username", "POST", {
        newUsername: username
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldError("username", {
          type: "custom",
          message: data.message ?? "An error occurred changing your username"
        });
        return;
      }

      setProfile((prev) => ({
        ...prev,
        username
      }));
      closeModal();
      console.log(data);
    } catch (error) {
      console.error(error);
      setFieldError("username", {
        type: "custom",
        message: "An error occurred changing your username"
      });
    }
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Edit Username</h2>
      <form onSubmit={handleSubmit(submitData)}>
        <div className={styles["input-container"]}>
          <Input
            type="text"
            placeholder="Display name"
            name={usernameRegister.name}
            onChange={usernameRegister.onChange}
            onBlur={usernameRegister.onBlur}
            inputRef={usernameRegister.ref}
            error={errors.username?.message}
          />
          <LoaderButton type="submit" loading={isSubmitting}>
            Save
          </LoaderButton>
        </div>
      </form>
    </div>
  );
}
