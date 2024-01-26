"use client";
import ProfileCard from "@/app/(main)/components/ProfileCard";
import VoiceCallControl from "@/app/(main)/components/VoiceCallControl";
import { useServer } from "@/contexts/ServerContext";
import { useUiContext } from "@/contexts/UiContext";
import { useVoiceCall } from "@/contexts/VoiceChatContext";
import usePusherEvent from "@/hooks/usePusherEvent";
import { apiFetch } from "@/lib/api";
import {
  addExplicitlyOrderedElement,
  moveExplicitlyOrderedElement,
  removeExplicitlyOrderedElement
} from "@/lib/clientUtils";
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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AddGroupModal from "../AddGroupModal";
import EditableChannelGroup from "../EditableChannelGroup";
import EditableChannelItem from "../EditableChannelItem";
import ServerCard from "../ServerCard";
import SidebarChannelsLoading from "../SidebarChannelsLoading";
import styles from "./styles.module.scss";

export default function EditableSidebar() {
  const [channelGroups, setChannelGroups] = useState<IClientChannelGroup[]>([]);
  const [isLoadingChannelGroups, setIsLoadingChannelGroups] = useState(true);
  const { serverInfo } = useServer();
  const { mobileNavExpanded, addModal } = useUiContext();
  const { call } = useVoiceCall();
  const router = useRouter();
  const pathname = usePathname();
  const [draggedGroup, setDraggedGroup] = useState<IClientChannelGroup | null>(
    null
  );
  const [draggedChannel, setDraggedChannel] = useState<IClientChannel | null>(
    null
  );
  const draggedOriginGroup = useRef<string | null>(null);

  const sortedChannelGroups = useMemo(() => {
    return channelGroups.sort((a, b) => a.uiOrder - b.uiOrder);
  }, [channelGroups]);

  const groupIds = useMemo(() => {
    return sortedChannelGroups.map((group) => group.id);
  }, [sortedChannelGroups]);

  useEffect(() => {
    (async () => {
      setIsLoadingChannelGroups(true);
      try {
        const res = await apiFetch(
          `/server/channel-group/list/${serverInfo.serverId}`
        );
        const { channelGroups } = (await res.json()) as {
          channelGroups: IClientChannelGroup[];
        };
        setChannelGroups(channelGroups);
        setIsLoadingChannelGroups(false);
      } catch (error) {
        console.error(error);
        setIsLoadingChannelGroups(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoadingChannelGroups) return;
    const splitPath = pathname.split("/");
    const currentChannelId = splitPath[splitPath.length - 1];
    if (
      !channelGroups.some((group) =>
        group.channels.some((channel) => channel.channelId === currentChannelId)
      )
    ) {
      // Channel has been removed
      router.push(`/server/${serverInfo.serverId}`);
    }
  }, [channelGroups, isLoadingChannelGroups]);

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
          const channels = prevGroup.channels;
          const isJoinedGroup = channels.some(
            (channel) => channel.channelId === channelId
          );
          if (!isJoinedGroup) {
            return prevGroup;
          } else {
            const channelIndex = channels.findIndex(
              (channel) => channel.channelId === channelId
            );
            const channel = channels[channelIndex];
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

  async function moveChannelGroup(channelGroupId: string, newUiOrder: number) {
    try {
      await apiFetch(
        `/server/channel-group/rearrange/${serverInfo.serverId}`,
        "POST",
        {
          channelGroupId,
          newUiOrder
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function moveChannel(
    channelId: string,
    newUiOrder: number,
    newGroupId?: string
  ) {
    try {
      await apiFetch(
        `/server/channel/rearrange/${serverInfo.serverId}`,
        "POST",
        { channelId, newUiOrder, newGroupId }
      );
    } catch (error) {
      console.error(error);
    }
  }

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
      const group = channelGroups.find((channelGroup) =>
        channelGroup.channels.some(
          (channel) => channel.channelId === activeChannel?.channelId
        )
      );
      draggedOriginGroup.current = group?.id ?? null;
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeType = active.data.current?.type;
    if (activeType === "channelGroup") {
      const activeGroupId = active.id as string;
      const overGroupId = over.id as string;
      const overGroup = channelGroups.find(
        (channelGroup) => channelGroup.id === overGroupId
      );
      if (activeGroupId === overGroupId || !overGroup) return;
      setChannelGroups((prev) =>
        moveExplicitlyOrderedElement(
          prev,
          (item) => item.id === activeGroupId,
          overGroup.uiOrder
        )
      );
      moveChannelGroup(activeGroupId, overGroup.uiOrder);
    } else if (activeType === "channel") {
      const overChannel = channelGroups
        .flatMap((channelGroup) => channelGroup.channels)
        .find((channel) => channel.channelId === over.id);
      const overGroup = channelGroups.find((group) =>
        group.channels.some((channel) => channel.channelId === over.id)
      );

      if (!overChannel || !overGroup) return;

      if (active.id === over.id && overGroup.id === draggedOriginGroup.current)
        return;

      setChannelGroups((prev) => {
        return prev.map((prevGroup) => {
          if (prevGroup === overGroup) {
            return {
              ...prevGroup,
              channels: moveExplicitlyOrderedElement(
                prevGroup.channels,
                (item) => item.channelId === active.id,
                overChannel.uiOrder
              )
            };
          } else {
            return prevGroup;
          }
        });
      });
      let newGroupId;
      if (overGroup && overGroup?.id !== draggedOriginGroup.current) {
        newGroupId = overGroup?.id;
      }

      moveChannel(active.id as string, overChannel.uiOrder, newGroupId);
    }
    setDraggedGroup(null);
    draggedOriginGroup.current = null;
    setDraggedChannel(null);
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "channel" && overType === "channel") {
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
              channels: removeExplicitlyOrderedElement(
                prevGroup.channels,
                (channel) => channel.channelId === active.id
              )
            };
          } else if (prevGroup.id === overGroup.id) {
            return {
              ...prevGroup,
              channels: addExplicitlyOrderedElement(
                activeChannel,
                prevGroup.channels,
                overChannel.uiOrder
              )
            };
          } else {
            return prevGroup;
          }
        });
      });
    } else if (activeType === "channel" && overType === "addChannelButton") {
      const overGroupId = (over.id as string).split("-")[1];
      const activeChannel = channelGroups
        .flatMap((channelGroup) => channelGroup.channels)
        .find((channel) => channel.channelId === active.id);
      if (!activeChannel) return;

      setChannelGroups((prev) => {
        return prev.map((prevGroup) => {
          if (prevGroup.id === overGroupId) {
            let newChannels = removeExplicitlyOrderedElement(
              prevGroup.channels,
              (channel) => channel.channelId === activeChannel.channelId
            );
            newChannels = addExplicitlyOrderedElement(
              activeChannel,
              newChannels
            );
            return { ...prevGroup, channels: newChannels };
          } else {
            return {
              ...prevGroup,
              channels: removeExplicitlyOrderedElement(
                prevGroup.channels,
                (channel) => channel.channelId === activeChannel.channelId
              )
            };
          }
        });
      });
    }
  }

  function handleDeleteChannel(channelId: string) {
    setChannelGroups((prev) =>
      prev.map((prevGroup) => {
        if (
          prevGroup.channels.some((channel) => channel.channelId === channelId)
        ) {
          return {
            ...prevGroup,
            channels: prevGroup.channels.filter(
              (channel) => channel.channelId !== channelId
            )
          };
        } else {
          return prevGroup;
        }
      })
    );
  }

  function handleDeleteGroup(groupId: string) {
    setChannelGroups((prev) => prev.filter((group) => group.id !== groupId));
  }

  return (
    <div
      className={[
        styles["sidebar"],
        mobileNavExpanded ? "" : styles["hidden"]
      ].join(" ")}
    >
      <ServerCard />
      {isLoadingChannelGroups ? (
        <SidebarChannelsLoading />
      ) : (
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          id="EditableSidebarDnDContext"
        >
          <nav className={styles["nav"]}>
            <ul className={styles["nav-list"]}>
              <SortableContext
                items={groupIds}
                strategy={verticalListSortingStrategy}
                id="EditableSidebarSortableContext"
              >
                {sortedChannelGroups.map((group) => (
                  <EditableChannelGroup
                    channelGroup={group}
                    key={group.uiOrder}
                    onDeleteChannel={handleDeleteChannel}
                    onDeleteGroup={() => handleDeleteGroup(group.id)}
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
      )}
      {call && <VoiceCallControl />}
      <ProfileCard />
    </div>
  );
}
