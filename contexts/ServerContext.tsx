"use client";
import { ReactNode, createContext, useContext } from "react";

interface IServerContext {}

const ServerContext = createContext<IServerContext>({} as IServerContext);

interface Props {
  children: ReactNode;
}

export default function ServerContextProvider({ children }: Props) {
  return <ServerContext.Provider value={{}}>{children}</ServerContext.Provider>;
}

export function useServer() {
  return useContext(ServerContext);
}
