"use client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUiContext } from "@/contexts/UiContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import TextChannelIcon from "@/public/align-left-solid.svg";
import GripIcon from "@/public/grip-vertical-solid.svg";
import VoiceChannelIcon from "@/public/microphone-solid.svg";
import { IClientChannel } from "@/types/server";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, useMemo } from "react";
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
  setActivatorNodeRef(element: HTMLElement | null): void;
}

export default function ChannelItem({
  channel,
  isEditable,
  setNodeRef,
  attributes,
  listeners,
  isDragging,
  style,
  setActivatorNodeRef
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { closeMobileNav } = useUiContext();
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
        {channel.type === "text" ? (
          <TextChannelIcon />
        ) : channel.type === "voice" ? (
          <VoiceChannelIcon />
        ) : (
          <></>
        )}
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
