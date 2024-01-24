"use client";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import { apiFetch } from "@/lib/api";
import TextChannelIcon from "@/public/align-left-solid.svg";
import GripIcon from "@/public/grip-vertical-solid.svg";
import VoiceChannelIcon from "@/public/microphone-solid.svg";
import TrashIcon from "@/public/trash-solid.svg";
import { IClientChannel } from "@/types/server";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, MouseEvent, useMemo } from "react";
import VoiceCallMember from "../VoiceCallMember";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
  isEditable?: boolean;
  style?: CSSProperties;
  setNodeRef?(node: HTMLElement | null): void;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  isDragging?: boolean;
  setActivatorNodeRef?(element: HTMLElement | null): void;
  onDelete?(): void;
}

export default function ChannelItem({
  channel,
  isEditable,
  setNodeRef,
  attributes,
  listeners,
  isDragging,
  style,
  setActivatorNodeRef,
  onDelete
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { closeMobileNav, addModal, closeModal } = useUiContext();
  const { joinVoiceCall, call } = useVoiceCall();
  const { profile } = useAuthContext();

  const isBeingViewed = useMemo(() => {
    return pathname.endsWith(channel.channelId);
  }, [pathname]);

  function handleClick() {
    if (channel.type === "text") {
      if (isBeingViewed) {
        closeMobileNav();
      } else {
        router.push(`/server/${channel.serverId}/${channel.channelId}`);
      }
    } else if (channel.type === "voice") {
      if (call?.channelId === channel.channelId) {
        router.push(`/server/${channel.serverId}/${channel.channelId}`);
      } else {
        joinVoiceCall(channel);
      }

      if (isBeingViewed) {
        closeMobileNav();
      }
    } else {
      router.push(`/server/${channel.serverId}/${channel.channelId}`);
    }
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!isEditable) return;
    addModal(
      <ConfirmationModal
        title={`Are you sure you want to delete ${channel.name}?`}
        confirmMessage="Yes, delete"
        cancelMessage="No, cancel"
        confirmCallback={confirmDelete}
      />
    );
  }

  async function confirmDelete() {
    if (onDelete) onDelete();
    try {
      const res = await apiFetch(
        `/server/channel/delete/${channel.serverId}`,
        "DELETE",
        {
          channelId: channel.channelId
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message ?? "ERROR :(");
      }
      console.log(data);
    } catch (error) {
      console.error(error);
    }
    closeModal();
  }

  return (
    <li
      className={[
        styles["channel-item"],
        isDragging ? styles["being-dragged"] : ""
      ].join(" ")}
      style={style}
      ref={setNodeRef}
    >
      <button
        className={[
          styles["channel-button"],
          isBeingViewed ? styles["selected"] : ""
        ].join(" ")}
        onClick={handleClick}
      >
        <div className={isEditable ? styles["editable-icon"] : styles["icon"]}>
          {channel.type === "text" ? (
            <TextChannelIcon className={styles["main-icon"]} />
          ) : channel.type === "voice" ? (
            <VoiceChannelIcon className={styles["main-icon"]} />
          ) : (
            <></>
          )}
          {isEditable && (
            <div className={styles["delete-button"]} onClick={handleDelete}>
              <TrashIcon />
            </div>
          )}
        </div>
        <span className={styles["channel-name"]}>{channel.name}</span>
        {isEditable && (
          <div
            className={styles["move-channel-grip"]}
            {...attributes}
            {...listeners}
            ref={setActivatorNodeRef}
          >
            <GripIcon />
          </div>
        )}
      </button>
      {channel.type === "voice" && channel.callMembers && (
        <ul className={styles["voice-call-members"]}>
          {channel.callMembers.map(
            (member) =>
              (call?.channelId === channel.channelId ||
                member.id !== profile.id) && (
                <VoiceCallMember user={member} key={member.id} />
              )
          )}
          {!channel.callMembers.some((member) => member.id === profile.id) &&
            call?.channelId === channel.channelId && (
              <VoiceCallMember user={profile} isPreview={true} />
            )}
        </ul>
      )}
    </li>
  );
}
