import ServerContextProvider from "@/contexts/ServerContext";
import { getSession } from "@/lib/auth";
import {
  getMember,
  getServer,
  sterilizeClientChannel,
  sterilizeClientServer
} from "@/lib/server";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import ServerSidebar from "./components/ServerSidebar";

interface Props {
  params: {
    serverId: string;
  };
  children: ReactNode;
}

export default async function ServerLayout({ params, children }: Props) {
  const { serverId } = params;
  if (!isValidObjectId(serverId)) {
    return redirect("/");
  }

  const sessionId = cookies().get("session")?.value;
  if (!sessionId) redirect("/login");

  const { query, userType } = getSession(sessionId);
  if (userType !== "verified" || !query) redirect("/login");

  const session = await query;
  if (!session) redirect("login");
  const { user: userId } = session;

  const [server, member] = await Promise.all([
    getServer(serverId),
    getMember(serverId, userId.toString())
  ]);
  if (!server || !member) redirect("/");

  const channelGroups = server.channelGroups.map((group) => ({
    channels: group.channels.map((channel) =>
      sterilizeClientChannel(channel.channel, channel.uiOrder)
    ),
    name: group.name,
    uiOrder: group.uiOrder
  }));
  const clientServer = sterilizeClientServer(server);

  return (
    <ServerContextProvider
      initialChannelGroups={channelGroups}
      initialServerInfo={clientServer}
      initialRole={member.role}
    >
      <ServerSidebar />
      {children}
    </ServerContextProvider>
  );
}
