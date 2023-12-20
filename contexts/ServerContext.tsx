"use client";
import { IClientChannel } from "@/types/server";
import { ReactNode, createContext, useContext, useState } from "react";

interface IServerContext {
  channelGroups: {
    name: string;
    uiOrder: number;
    channels: IClientChannel[];
  }[];
}

const ServerContext = createContext<IServerContext>({} as IServerContext);

interface Props {
  children: ReactNode;
  initialChannelGroups: {
    name: string;
    uiOrder: number;
    channels: IClientChannel[];
  }[];
}

export default function ServerContextProvider({
  children,
  initialChannelGroups
}: Props) {
  const [channelGroups, setChannelGroups] = useState(initialChannelGroups);

  return (
    <ServerContext.Provider value={{ channelGroups }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}
