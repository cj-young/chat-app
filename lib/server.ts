import { IUser } from "@/models/User";
import Channel, { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { IClientChannel, IClientServer, TChannelType } from "@/types/server";
import { Types, isValidObjectId } from "mongoose";

import "server-only";

export function sterilizeClientServer(
  server: Pick<IServer, "id" | "name" | "imageUrl">,
): IClientServer {
  return {
    serverId: server.id,
    name: server.name,
    imageUrl: server.imageUrl,
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
    "channelGroups.channels.channel",
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
  uiOrder: number,
): IClientChannel {
  return {
    channelId: channel.id,
    serverId: channel.server.toString(),
    name: channel.name,
    type: channel.channelType,
    uiOrder,
  };
}

export function getInviteLink(code: string) {
  return `${process.env.BASE_URL}/invite/${code}`;
}

export function getDefaultChannelId(server: IServer) {
  if (server.homeChannel) {
    return server.homeChannel.toString();
  } else {
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

export async function addChannelGroup(serverId: string, groupName: string) {
  if (!isValidObjectId(serverId)) {
    return { error: "Invalid server ID" } as const;
  }

  const server = await Server.findById<IServer>(serverId);
  if (!server) {
    return { error: "Invalid server ID" } as const;
  }

  const channelGroup = {
    name: groupName,
    channels: [],
    uiOrder: server.channelGroups.length,
    _id: new Types.ObjectId(),
  };

  server.channelGroups.push(channelGroup);
  await server.save();

  return { channelGroup, server };
}

export async function addChannel(
  serverId: string,
  groupId: string,
  name: string,
  type: TChannelType,
) {
  if (!isValidObjectId(serverId)) {
    return { error: "Invalid server ID" } as const;
  }

  const server = await Server.findById<IServer>(serverId);
  if (!server) {
    return { error: "Invalid server ID" } as const;
  }

  const channel = (await Channel.create({
    server: serverId,
    name,
    channelType: type,
  })) as IChannel;

  if (!channel) return { error: "Channel creation failed" } as const;

  let channelUiOrder;
  for (let channelGroup of server.channelGroups) {
    if (channelGroup.id === groupId) {
      channelUiOrder = channelGroup.channels.length;
      channelGroup.channels.push({
        channel: channel.id,
        uiOrder: channelUiOrder,
      });
      break;
    }
  }

  await server.save();

  await Member.updateMany(
    { server: server.id },
    {
      $push: {
        channels: {
          channel: channel.id,
          unreadMessage: 0,
        },
      },
    },
  );

  return { channel, server, channelUiOrder };
}
