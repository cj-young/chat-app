"use client";
import { useUiContext } from "@/contexts/UiContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import TextChannelIcon from "@/public/align-left-solid.svg";
import VoiceChannelIcon from "@/public/microphone-solid.svg";
import { IClientChannel } from "@/types/server";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import VoiceCallMember from "../VoiceCallMember";
import styles from "./styles.module.scss";

interface Props {
  channel: IClientChannel;
}

export default function ChannelItem({ channel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { closeMobileNav } = useUiContext();
  const { joinVoiceCall, leaveVoiceCall } = useVoiceCall();

  const isBeingViewed = useMemo(() => {
    return pathname.endsWith(channel.channelId);
  }, [pathname]);

  function handleClick() {
    if (isBeingViewed) {
      closeMobileNav();
    } else {
      if (channel.type === "voice") {
        joinVoiceCall(channel);
      }
      router.push(`/server/${channel.serverId}/${channel.channelId}`);
    }
  }

  return (
    <li className={styles["channel-item"]}>
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
      </button>
      {channel.type === "voice" && channel.callMembers && (
        <ul className={styles["voice-call-members"]}>
          {channel.callMembers.map((member) => (
            <VoiceCallMember user={member} key={member.id} />
          ))}
        </ul>
      )}
    </li>
  );
}
