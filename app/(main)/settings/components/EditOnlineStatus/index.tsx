"use client";
import LoaderButton from "@/components/LoaderButton";
import DoNotDisturbIcon from "@/components/svgs/DoNotDisturbIcon";
import IdleIcon from "@/components/svgs/IdleIcon";
import OfflineIcon from "@/components/svgs/OfflineIcon";
import OnlineIcon from "@/components/svgs/OnlineIcon";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { OnlineStatusInfo, onlineStatusSchema } from "@/lib/schema";
import XIcon from "@/public/xmark-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

export default function EditOnlineStatus() {
  const { closeModal } = useUiContext();
  const { profile, setProfile } = useAuthContext();
  const {
    register,
    watch,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<OnlineStatusInfo>({
    resolver: zodResolver(onlineStatusSchema),
    defaultValues: {
      onlineStatus:
        profile.onlineStatus === "offline" ? "invisible" : profile.onlineStatus
    }
  });
  const watchOnlineStatus = watch("onlineStatus");

  async function submitData({ onlineStatus }: OnlineStatusInfo) {
    try {
      const res = await apiFetch("/user/online-status", "POST", {
        newOnlineStatus: onlineStatus
      });
      const data = await res.json();
      if (!res.ok) {
        return console.error(data.message ?? "An error occurred");
      }

      setProfile((prev) => ({
        ...prev,
        onlineStatus: onlineStatus === "invisible" ? "offline" : onlineStatus
      }));
      closeModal();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Edit Online Status</h2>
      <form onSubmit={handleSubmit(submitData)} className={styles["form"]}>
        <h3>Type of channel</h3>
        <div className={styles["online-status-container"]}>
          <label
            htmlFor="online-status-online"
            className={[
              styles["online-status"],
              watchOnlineStatus === "online" ? styles["selected"] : ""
            ].join(" ")}
          >
            <input
              {...register("onlineStatus")}
              id="online-status-online"
              type="radio"
              value="online"
              className={styles["online-status-input"]}
            />
            <div className={styles["online-status-icon-wrapper"]}>
              <OnlineIcon />
            </div>
            Online
          </label>
          <label
            htmlFor="online-status-invisible"
            className={[
              styles["online-status"],
              watchOnlineStatus === "invisible" ? styles["selected"] : ""
            ].join(" ")}
          >
            <input
              {...register("onlineStatus")}
              id="online-status-invisible"
              type="radio"
              value="invisible"
              className={styles["online-status-input"]}
            />
            <div className={styles["online-status-icon-wrapper"]}>
              <OfflineIcon />
            </div>
            Invisible
          </label>
          <label
            htmlFor="online-status-do-not-disturb"
            className={[
              styles["online-status"],
              watchOnlineStatus === "doNotDisturb" ? styles["selected"] : ""
            ].join(" ")}
          >
            <input
              {...register("onlineStatus")}
              id="online-status-do-not-disturb"
              type="radio"
              value="doNotDisturb"
              className={styles["online-status-input"]}
            />
            <div className={styles["online-status-icon-wrapper"]}>
              <DoNotDisturbIcon />
            </div>
            Do Not Disturb
          </label>
          <label
            htmlFor="online-status-idle"
            className={[
              styles["online-status"],
              watchOnlineStatus === "idle" ? styles["selected"] : ""
            ].join(" ")}
          >
            <input
              {...register("onlineStatus")}
              id="online-status-idle"
              type="radio"
              value="idle"
              className={styles["online-status-input"]}
            />
            <div className={styles["online-status-icon-wrapper"]}>
              <IdleIcon />
            </div>
            Idle
          </label>
        </div>

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
