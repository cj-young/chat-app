"use client";
import usePusherEvent from "@/hooks/usePusherEvent";
import {
  IClientChannel,
  IClientMember,
  IClientServer,
  TRole
} from "@/types/server";
import { TOnlineStatus } from "@/types/user";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { usePusher } from "./PusherContext";

interface IServerContext {
  channelGroups: {
    name: string;
    uiOrder: number;
    channels: IClientChannel[];
  }[];
  serverInfo: IClientServer;
  role: TRole;
  members: IClientMember[];
}

const ServerContext = createContext<IServerContext>({} as IServerContext);

interface Props {
  children: ReactNode;
  initialChannelGroups: {
    name: string;
    uiOrder: number;
    channels: IClientChannel[];
  }[];
  initialServerInfo: IClientServer;
  initialRole: TRole;
  initialMembers: IClientMember[];
}

export default function ServerContextProvider({
  children,
  initialChannelGroups,
  initialServerInfo,
  initialRole,
  initialMembers
}: Props) {
  const [channelGroups, setChannelGroups] = useState(initialChannelGroups);
  const [serverInfo, setServerInfo] = useState(initialServerInfo);
  const [role, setRole] = useState(initialRole);
  const [members, setMembers] = useState(initialMembers);

  const { subscribeToEvent, unsubscribeFromEvent } = usePusher();

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "userJoined",
    (member: IClientMember) => {
      console.log(member);
      setMembers((prev) => [...prev, member]);
    }
  );

  usePusherEvent(
    `private-server-${serverInfo.serverId}`,
    "userLeft",
    ({ memberId }: { memberId: string }) => {
      console.log(memberId);
      setMembers((prev) =>
        prev.filter((prevMember) => prevMember.id !== memberId)
      );
    }
  );

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

  useEffect(() => {
    const memberCallbacks = new Map<string, Function>();
    for (let member of members) {
      if (memberCallbacks.has(member.user.id)) continue;
      const onOnlineStatusChange = ({
        onlineStatus
      }: {
        onlineStatus: TOnlineStatus;
      }) => {
        setMembers((prev) =>
          prev.map((prevMember) =>
            prevMember.user.id !== member.user.id
              ? prevMember
              : { ...member, user: { ...member.user, onlineStatus } }
          )
        );
      };

      memberCallbacks.set(member.user.id, onOnlineStatusChange);
      subscribeToEvent(
        `profile-${member.user.id}`,
        "onlineStatusChanged",
        onOnlineStatusChange
      );
    }
    return () => {
      for (let [userId, callback] of memberCallbacks) {
        unsubscribeFromEvent(
          `profile-${userId}`,
          "onlineStatusChanged",
          callback
        );
      }
    };
  }, [members]);

  return (
    <ServerContext.Provider
      value={{ channelGroups, serverInfo, role, members }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}
