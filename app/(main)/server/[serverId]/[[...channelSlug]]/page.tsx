import dbConnect from "@/lib/db";
import { sterilizeClientChannel } from "@/lib/server";
import Channel, { IChannel } from "@/models/server/Channel";
import Server, { IServer } from "@/models/server/Server";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChannelChatContainer from "./components/ChannelChatContainer";

interface Props {
  params: {
    serverId: string;
    channelSlug: string[];
  };
}

export default async function ChannelPage({ params }: Props) {
  const sessionId = cookies().get("session")?.value;
  const { serverId } = params;
  if (!isValidObjectId(serverId)) redirect("/");

  if (!params.channelSlug || params.channelSlug.length === 0) {
    const server = await Server.findById<IServer>(serverId);
    if (!server) redirect("/");
    if (server.homeChannel) {
      redirect(`/server/${serverId}/${server.homeChannel.toString()}`);
    } else {
      let minChannelId: string | null = null;
      let minChannelGroupOrder = Number.MAX_VALUE;
      let minChannelOrder = Number.MAX_VALUE;
      for (let channelGroup of server.channelGroups) {
        if (channelGroup.uiOrder <= minChannelGroupOrder) {
          for (let channel of channelGroup.channels) {
            if (channel.uiOrder < minChannelOrder) {
              minChannelId = channel.channel.toString();
            }
          }
        }
      }
      if (!minChannelId) redirect("/");
      redirect(`/server/${serverId}/${minChannelId}`);
    }
  }
  const channelId = params.channelSlug[0];

  await dbConnect();

  if (params.channelSlug.length > 1)
    redirect(`/server/${serverId}/${channelId}`);
  if (!sessionId || sessionId[0] !== "1") redirect("/login");
  if (!isValidObjectId(channelId)) redirect(`/server/${serverId}`);

  const channel = await Channel.findById<IChannel>(channelId);
  if (!channel) redirect(`/server/${serverId}`);

  return <ChannelChatContainer channel={sterilizeClientChannel(channel, 0)} />;
}
