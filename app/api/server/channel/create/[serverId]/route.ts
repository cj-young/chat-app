import { getSession, invalidSession } from "@/lib/auth";
import Channel, { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { userType, query } = getSession(sessionId);
    if (!query || userType !== "verified") return invalidSession();

    const session = await query;
    if (!session || session.isExpired()) return invalidSession();

    const { user: userId } = session;
    const { channelType, name, groupOrder } = (await req.json()) as {
      channelType: "text";
      name: string;
      groupOrder: number;
    };

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json({ message: "Invalid server ID" });

    const member = await Member.findOne<IMember>({
      user: userId,
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

    for (let channelGroup of server.channelGroups) {
      if (channelGroup.uiOrder === groupOrder) {
        channelGroup.channels.push({
          channel: channel.id,
          uiOrder: channelGroup.channels.length
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

    return NextResponse.json({ message: "Successfully created channel" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
