"use client";
import Input from "@/components/Input";
import LoaderButton from "@/components/LoaderButton";
import { useUiContext } from "@/contexts/UiContext";
import { apiFetch } from "@/lib/api";
import { CreateChannelInfo, createChannelSchema } from "@/lib/schema";
import TextChannelIcon from "@/public/align-left-solid.svg";
import VoiceChannelIcon from "@/public/microphone-solid.svg";
import XIcon from "@/public/xmark-solid.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";

interface Props {
  groupName: string;
  groupId: string;
  serverId: string;
}

export default function AddChannelModal({
  groupName,
  groupId,
  serverId
}: Props) {
  const { closeModal } = useUiContext();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateChannelInfo>({
    resolver: zodResolver(createChannelSchema)
  });
  const watchChannelType = watch("channelType");

  async function submitData({ channelType, name }: CreateChannelInfo) {
    await apiFetch(`/server/channel/create/${serverId}`, "POST", {
      channelType,
      name,
      groupId
    });
    closeModal();
  }

  const nameRegister = register("name");

  return (
    <div className={styles["modal"]}>
      <button className={styles["exit-modal"]} onClick={closeModal}>
        <XIcon />
      </button>
      <h2 className={styles["title"]}>Add channel</h2>
      <p className={styles["caption"]}>
        to group <b>{groupName}</b>
      </p>

      <form onSubmit={handleSubmit(submitData)} className={styles["form"]}>
        <h3>Type of channel</h3>
        <div className={styles["channel-type-container"]}>
          <label
            htmlFor="channel-type-text"
            className={[
              styles["channel-type"],
              watchChannelType === "text" ? styles["selected"] : ""
            ].join(" ")}
          >
            <input
              {...register("channelType")}
              id="channel-type-text"
              type="radio"
              value="text"
              className={styles["channel-type-input"]}
            />
            <TextChannelIcon />
            Text
          </label>
          <label
            htmlFor="channel-type-voice"
            className={[
              styles["channel-type"],
              watchChannelType === "voice" ? styles["selected"] : ""
            ].join(" ")}
          >
            <input
              {...register("channelType")}
              id="channel-type-voice"
              type="radio"
              value="voice"
              className={styles["channel-type-input"]}
            />
            <VoiceChannelIcon />
            Voice
          </label>
        </div>
        <Input
          type="text"
          placeholder="Name of channel"
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
