import ServerContextProvider from "@/contexts/ServerContext";
import { ReactNode } from "react";

interface Props {
  params: {
    serverId: string;
  };
  children: ReactNode;
}

export default function ServerLayout({ params, children }: Props) {
  return (
    <ServerContextProvider>
      <div> ServerId: {params.serverId}</div>
      {children}
    </ServerContextProvider>
  );
}
