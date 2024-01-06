import { IUser } from "@/models/User";
import { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { IClientChannel, IClientServer } from "@/types/server";
import { isValidObjectId } from "mongoose";

import "server-only";

export function sterilizeClientServer(
  server: Pick<IServer, "id" | "name" | "imageUrl">
): IClientServer {
  return {
    serverId: server.id,
    name: server.name,
    imageUrl: server.imageUrl
  };
}

export async function getServer(serverId: string) {
  if (!isValidObjectId(serverId)) return null;

  const server = await Server.findById<IServer>(serverId).populate<
    Omit<IServer, "members" | "channelGroups"> & {
      members: (Omit<IMember, "user"> & { user: IUser })[];
      channelGroups: {
        id: string;
        name: string;
        channels: { channel: IChannel; uiOrder: number }[];
        uiOrder: number;
      }[];
    }
  >([
    { path: "members", model: Member, populate: "user" },
    "channelGroups.channels.channel"
  ]);
  if (!server) return null;
  return server;
}

export async function getMember(serverId: string, userId: string) {
  if (!isValidObjectId(serverId) || !isValidObjectId(userId)) return null;

  return await Member.findOne<IMember>({ server: serverId, user: userId });
}

export function sterilizeClientChannel(
  channel: IChannel,
  uiOrder: number
): IClientChannel {
  return {
    channelId: channel.id,
    serverId: channel.server.toString(),
    name: channel.name,
    type: channel.channelType,
    uiOrder
  };
}

export function getInviteLink(code: string) {
  return `${process.env.BASE_URL}/invite/${code}`;
}

export function getDefaultChannelId(server: IServer) {
  if (server.homeChannel) {
    return server.homeChannel.toString();
  } else {
    console.log(server);
    let minChannelId: string | null = null;
    let minChannelGroupOrder = Number.MAX_VALUE;
    let minChannelOrder = Number.MAX_VALUE;
    for (let channelGroup of server.channelGroups) {
      if (channelGroup.uiOrder <= minChannelGroupOrder) {
        if (
          channelGroup.uiOrder < minChannelGroupOrder &&
          channelGroup.channels.length > 0
        ) {
          minChannelId = channelGroup.channels[0].channel.toString();
          minChannelGroupOrder = channelGroup.uiOrder;
          minChannelOrder = channelGroup.channels[0].uiOrder;
        }
        for (let channel of channelGroup.channels) {
          if (channel.uiOrder < minChannelOrder) {
            minChannelId = channel.channel.toString();
            minChannelGroupOrder = channelGroup.uiOrder;
            minChannelOrder = channel.uiOrder;
          }
        }
      }
    }
    return minChannelId;
  }
}
