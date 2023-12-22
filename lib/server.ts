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
      members: IMember[];
      channelGroups: {
        name: string;
        channels: { channel: IChannel; uiOrder: number }[];
        uiOrder: number;
      }[];
    }
  >(["members", "channelGroups.channels.channel"]);
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
