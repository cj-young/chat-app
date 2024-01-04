"use client";
import ProfileCard from "@/app/(main)/components/ProfileCard";
import VoiceCallControl from "@/app/(main)/components/VoiceCallControl";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import usePusherEvent from "@/hooks/usePusherEvent";
import { apiFetch } from "@/lib/api";
import PlusSymbol from "@/public/plus-solid.svg";
import { IClientChannel, IClientChannelGroup } from "@/types/server";
import { IProfile } from "@/types/user";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import AddGroupModal from "../AddGroupModal";
import EditableChannelGroup from "../EditableChannelGroup";
import EditableChannelItem from "../EditableChannelItem";
import ServerCard from "../ServerCard";
import styles from "./styles.module.scss";

export default function EditableSidebar() {
  const [channelGroups, setChannelGroups] = useState<IClientChannelGroup[]>([]);
  const { role, serverInfo } = useServer();
  const { mobileNavExpanded, addModal } = useUiContext();
  const { call } = useVoiceCall();
  const [draggedGroup, setDraggedGroup] = useState<IClientChannelGroup | null>(
    null
  );
  const [draggedChannel, setDraggedChannel] = useState<IClientChannel | null>(
    null
  );

  const sortedChannelGroups = useMemo(() => {
    return channelGroups.sort((a, b) => a.uiOrder - b.uiOrder);
  }, [channelGroups]);

  const groupIds = useMemo(() => {
    return sortedChannelGroups.map((group) => group.id);
  }, [sortedChannelGroups]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(
          `/server/channel-group/list/${serverInfo.serverId}`
        );
        const { channelGroups } = (await res.json()) as {
          channelGroups: IClientChannelGroup[];
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
    ({ channel, groupId }: { channel: IClientChannel; groupId: string }) => {
      setChannelGroups((prevGroups) =>
        prevGroups.map((prevGroup) => {
          if (prevGroup.id === groupId) {
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
      channelGroup: { name: string; channels: []; uiOrder: number; id: string };
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

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "userLeftVoiceCall",
    ({ channelId, userId }: { channelId: string; userId: string }) => {
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
            if (!channel.callMembers || channel.type === "text")
              return prevGroup;
            const newChannel = {
              ...channel,
              callMembers: channel.callMembers.filter(
                (member) => member.id !== userId
              )
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

  function handleDragStart(e: DragStartEvent) {
    if (e.active.data.current?.type === "channelGroup") {
      const activeGroup = channelGroups.find(
        (channelGroup) => channelGroup.id === e.active.id
      );
      setDraggedGroup(activeGroup ?? null);
    } else if (e.active.data.current?.type === "channel") {
      const activeChannel = channelGroups
        .flatMap((channelGroup) => channelGroup.channels)
        .find((channel) => channel.channelId === e.active.id);
      setDraggedChannel(activeChannel ?? null);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    if (active.data.current?.type === "channelGroup") {
      const activeGroupId = active.id;
      const overGroupId = over.id;
      if (activeGroupId === overGroupId) return;

      setChannelGroups((prev) => {
        const activeGroup = channelGroups.find(
          (channelGroup) => channelGroup.id === activeGroupId
        );
        const overGroup = channelGroups.find(
          (channelGroup) => channelGroup.id === overGroupId
        );
        if (!activeGroup || !overGroup) return prev;
        return prev.map((prevGroup) => {
          if (prevGroup.id === activeGroup.id) {
            return {
              ...prevGroup,
              uiOrder: overGroup.uiOrder
            };
          } else if (
            prevGroup.uiOrder > activeGroup.uiOrder &&
            prevGroup.uiOrder <= overGroup.uiOrder
          ) {
            return {
              ...prevGroup,
              uiOrder: prevGroup.uiOrder - 1
            };
          } else if (
            prevGroup.uiOrder < activeGroup.uiOrder &&
            prevGroup.uiOrder >= overGroup.uiOrder
          ) {
            return {
              ...prevGroup,
              uiOrder: prevGroup.uiOrder + 1
            };
          } else {
            return prevGroup;
          }
        });
      });
      setDraggedGroup(null);
    } else if (active.data.current?.type === "channel") {
      if (active.id === over.id) return;
      setChannelGroups((prev) => {
        const activeGroup = prev.find((group) =>
          group.channels.some((channel) => channel.channelId === active.id)
        );
        const overGroup = prev.find((group) =>
          group.channels.some((channel) => channel.channelId === over.id)
        );
        if (!activeGroup || !overGroup || activeGroup !== overGroup)
          return prev;

        const activeChannel = activeGroup.channels.find(
          (channel) => channel.channelId === active.id
        )!;
        const overChannel = activeGroup.channels.find(
          (channel) => channel.channelId === over.id
        )!;

        return prev.map((prevGroup) => {
          if (prevGroup.id !== activeGroup.id) {
            return prevGroup;
          } else {
            const newChannels = prevGroup.channels.map((channel) => {
              if (channel.channelId === active.id) {
                return { ...channel, uiOrder: overChannel.uiOrder };
              } else if (
                channel.uiOrder > activeChannel.uiOrder &&
                channel.uiOrder <= overChannel.uiOrder
              ) {
                return { ...channel, uiOrder: channel.uiOrder - 1 };
              } else if (
                channel.uiOrder < activeChannel.uiOrder &&
                channel.uiOrder >= overChannel.uiOrder
              ) {
                return { ...channel, uiOrder: channel.uiOrder + 1 };
              } else {
                return channel;
              }
            });
            return { ...prevGroup, channels: newChannels };
          }
        });
      });

      setDraggedChannel(null);
    }
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;

    if (
      active.data.current?.type === "channel" &&
      over.data.current?.type === "channel"
    ) {
      setChannelGroups((prev) => {
        const activeGroup = prev.find((group) =>
          group.channels.some((channel) => channel.channelId === active.id)
        );
        const overGroup = prev.find((group) =>
          group.channels.some((channel) => channel.channelId === over.id)
        );

        if (!activeGroup || !overGroup || activeGroup.id === overGroup.id)
          return prev;

        const activeChannel = activeGroup.channels.find(
          (channel) => channel.channelId === active.id
        )!;
        const overChannel = overGroup.channels.find(
          (channel) => channel.channelId === over.id
        )!;
        return prev.map((prevGroup) => {
          if (prevGroup.id === activeGroup.id) {
            return {
              ...prevGroup,
              channels: prevGroup.channels.filter(
                (channel) => channel.channelId !== activeChannel.channelId
              )
            };
          } else if (prevGroup.id === overGroup.id) {
            const newChannels = prevGroup.channels.map((channel) => {
              if (channel.uiOrder >= overChannel.uiOrder) {
                return {
                  ...channel,
                  uiOrder: channel.uiOrder + 1
                };
              } else {
                return channel;
              }
            });
            newChannels.push({
              ...activeChannel,
              uiOrder: overChannel.uiOrder
            });
            return { ...prevGroup, channels: newChannels };
          } else {
            return prevGroup;
          }
        });
      });
    }
  }

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <ServerCard />
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <nav className={styles["nav"]}>
          <ul className={styles["nav-list"]}>
            <SortableContext
              items={groupIds}
              strategy={verticalListSortingStrategy}
            >
              {sortedChannelGroups.map((group) => (
                <EditableChannelGroup
                  channelGroup={group}
                  key={group.uiOrder}
                />
              ))}
            </SortableContext>
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
          </ul>
        </nav>
        <DragOverlay>
          {draggedGroup ? (
            <EditableChannelGroup channelGroup={draggedGroup} />
          ) : draggedChannel ? (
            <EditableChannelItem channel={draggedChannel} />
          ) : null}
        </DragOverlay>
      </DndContext>
      {call && <VoiceCallControl />}
      <ProfileCard />
    </div>
  );
}
