"use client";
import LoaderButton from "@/components/LoaderButton";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import { ServerRoleInfo, serverRoleSchema } from "@/lib/schema";
import XIcon from "@/public/xmark-solid.svg";
import { IClientMember } from "@/types/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

interface Props {
  member: IClientMember;
}

export default function EditRoleModal({ member }: Props) {
  const { closeModal } = useUiContext();
  const { serverInfo } = useServer();
  const {
    register,
    watch,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<ServerRoleInfo>({
    resolver: zodResolver(serverRoleSchema),
    defaultValues: {
      role: member.role
    }
  });
  const watchRole = watch("role");

  async function submitData({ role }: ServerRoleInfo) {}

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Edit {member.user.displayName}'s role</h2>
      <form onSubmit={handleSubmit(submitData)} className={styles["form"]}>
        <label
          htmlFor="role-admin"
          className={[
            styles["role"],
            watchRole === "admin" ? styles["selected"] : ""
          ].join(" ")}
        >
          <input
            {...register("role")}
            id="role-admin"
            type="radio"
            value="admin"
            className={styles["role-input"]}
          />
          <span className={styles["role-name"]}>Admin</span>
          <p className={styles["role-description"]}>
            Admins can edit channels and change server settings
          </p>
        </label>
        <label
          htmlFor="role-guest"
          className={[
            styles["role"],
            watchRole === "guest" ? styles["selected"] : ""
          ].join(" ")}
        >
          <input
            {...register("role")}
            id="role-guest"
            type="radio"
            value="guest"
            className={styles["role-input"]}
          />
          <span className={styles["role-name"]}>Guest</span>
          <p className={styles["role-description"]}>
            Guests can talk in chat but cannot edit the server
          </p>
        </label>
        <LoaderButton
          className={styles["submit-button"]}
          loading={isSubmitting}
          type="submit"
        >
          Save
        </LoaderButton>
      </form>
    </div>
  );
}
