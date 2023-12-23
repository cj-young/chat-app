"use client";
import usePusherEvent from "@/hooks/usePusherEvent";
import {
  IClientChannel,
  IClientMember,
  IClientServer,
  TRole
} from "@/types/server";
import { ReactNode, createContext, useContext, useState } from "react";

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
