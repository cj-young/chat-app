"use client";
import { IClientChannel, IClientServer, TRole } from "@/types/server";
import { ReactNode, createContext, useContext, useState } from "react";

interface IServerContext {
  channelGroups: {
    name: string;
    uiOrder: number;
    channels: IClientChannel[];
  }[];
  serverInfo: IClientServer;
  role: TRole;
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
}

export default function ServerContextProvider({
  children,
  initialChannelGroups,
  initialServerInfo,
  initialRole
}: Props) {
  const [channelGroups, setChannelGroups] = useState(initialChannelGroups);
  const [serverInfo, setServerInfo] = useState(initialServerInfo);
  const [role, setRole] = useState(initialRole);

  return (
    <ServerContext.Provider value={{ channelGroups, serverInfo, role }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}
