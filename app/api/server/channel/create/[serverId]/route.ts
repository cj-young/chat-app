import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import { sterilizeClientChannel } from "@/lib/server";
import Channel, { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { TChannelType } from "@/types/server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;
    const { channelType, name, groupId } = (await req.json()) as {
      channelType: TChannelType;
      name: string;
      groupId: string;
    };

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json({ message: "Invalid server ID" });

    const member = await Member.findOne<IMember>({
      user: user.id,
      server: serverId
    });
    if (!member || !(member.role === "admin" || member.role === "owner"))
      return invalidSession();

    const channel = (await Channel.create({
      server: serverId,
      name,
      channelType
    })) as IChannel;

    if (!channel)
      return NextResponse.json(
        { message: "Channel creation failed" },
        { status: 500 }
      );

    const server = await Server.findById<IServer>(serverId);
    if (!server) return NextResponse.json({ message: "Invalid server" });

    let channelUiOrder;
    for (let channelGroup of server.channelGroups) {
      if (channelGroup.id === groupId) {
        channelUiOrder = channelGroup.channels.length;
        channelGroup.channels.push({
          channel: channel.id,
          uiOrder: channelUiOrder
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
            unreadMessage: 0
          }
        }
      }
    );

    const clientChannel = sterilizeClientChannel(channel, channelUiOrder ?? 0);
    await pusherServer.trigger(
      `private-server-${server.id}`,
      "channelCreated",
      {
        channel: clientChannel,
        groupId: groupId
      }
    );

    return NextResponse.json({ message: "Successfully created channel" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
