"use client";
import ProfileCard from "@/app/(main)/(home)/components/Sidebar/components/ProfileCard";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import usePusherEvent from "@/hooks/usePusherEvent";
import { apiFetch } from "@/lib/api";
import PlusSymbol from "@/public/plus-solid.svg";
import { IClientChannel } from "@/types/server";
import { IProfile } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import AddGroupModal from "../AddGroupModal";
import ChannelGroup from "../ChannelGroup";
import ServerCard from "../ServerCard";
import styles from "./styles.module.scss";

interface IChannelGroup {
  name: string;
  uiOrder: number;
  channels: IClientChannel[];
}

export default function ServerSidebar() {
  const [channelGroups, setChannelGroups] = useState<IChannelGroup[]>([]);
  const { role, serverInfo } = useServer();
  const { mobileNavExpanded, addModal } = useUiContext();

  const sortedChannelGroups = useMemo(() => {
    return channelGroups.sort((a, b) => a.uiOrder - b.uiOrder);
  }, [channelGroups]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(
          `/server/channel-group/list/${serverInfo.serverId}`
        );
        const { channelGroups } = (await res.json()) as {
          channelGroups: IChannelGroup[];
        };
        setChannelGroups(channelGroups);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "channelCreated",
    ({
      channel,
      groupUiOrder
    }: {
      channel: IClientChannel;
      groupUiOrder: number;
    }) => {
      setChannelGroups((prevGroups) =>
        prevGroups.map((prevGroup) => {
          if (prevGroup.uiOrder === groupUiOrder) {
            return { ...prevGroup, channels: [...prevGroup.channels, channel] };
          } else {
            return prevGroup;
          }
        })
      );
    }
  );

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "channelGroupCreated",
    ({
      channelGroup
    }: {
      channelGroup: { name: string; channels: []; uiOrder: number };
    }) => {
      setChannelGroups((prev) => [...prev, channelGroup]);
    }
  );

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "userJoinedVoiceCall",
    ({ channelId, user }: { channelId: string; user: IProfile }) => {
      setChannelGroups((prev) =>
        prev.map((prevGroup) => {
          if (
            !prevGroup.channels.some(
              (channel) => channel.channelId === channelId
            )
          ) {
            return prevGroup;
          } else {
            const channelIndex = prevGroup.channels.findIndex(
              (channel) => channel.channelId === channelId
            );
            const channel = prevGroup.channels[channelIndex];
            if (channel.callMembers?.some((member) => member.id === user.id)) {
              return prevGroup;
            }
            const newChannel = {
              ...channel,
              callMembers: channel.callMembers
                ? [...channel.callMembers, user]
                : [user]
            };

            return {
              ...prevGroup,
              channels: [
                ...prevGroup.channels.slice(0, channelIndex),
                newChannel,
                ...prevGroup.channels.slice(channelIndex + 1)
              ]
            };
          }
        })
      );
    }
  );

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <ServerCard />
      <nav className={styles["nav"]}>
        <ul className={styles["nav-list"]}>
          {sortedChannelGroups.map((group) => (
            <ChannelGroup
              name={group.name}
              channels={group.channels}
              key={group.uiOrder}
              uiOrder={group.uiOrder}
            />
          ))}
          {(role === "admin" || role === "owner") && (
            <li className={styles["add-group-container"]}>
              <button
                className={styles["add-channel"]}
                onClick={() =>
                  addModal(<AddGroupModal serverId={serverInfo.serverId} />)
                }
              >
                <PlusSymbol />
                <span>Add new group</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
      <ProfileCard />
    </div>
  );
}
