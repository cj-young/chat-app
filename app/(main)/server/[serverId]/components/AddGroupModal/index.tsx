"use client";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { CreateGroupInfo, createGroupSchema } from "@/lib/schema";
import XIcon from "@/public/xmark-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

interface Props {
  serverId: string;
}

export default function AddGroupModal({ serverId }: Props) {
  const { closeModal } = useUiContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateGroupInfo>({
    resolver: zodResolver(createGroupSchema)
  });

  async function submitData({ name }: CreateGroupInfo) {
    await apiFetch(`/server/channel-group/create/${serverId}`, "POST", {
      name
    });
    closeModal();
  }

  const nameRegister = register("name");

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Add channel group</h2>
      <form onSubmit={handleSubmit(submitData)} className={styles["form"]}>
        <Input
          type="text"
          placeholder="Name of channel group"
          name={nameRegister.name}
          onChange={nameRegister.onChange}
          onBlur={nameRegister.onBlur}
          inputRef={nameRegister.ref}
          error={errors.name?.message}
          className={styles["name-input"]}
        />
        <LoaderButton
          className={styles["submit-button"]}
          loading={isSubmitting}
          type="submit"
        >
          Add Channel
        </LoaderButton>
      </form>
    </div>
  );
}
