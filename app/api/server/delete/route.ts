import { getSession, invalidSession } from "@/lib/auth";
import Message from "@/models/Message";
import User from "@/models/User";
import Channel from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { Types, isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query;
    if (!session) return invalidSession();
    const { user: userId } = session;

    const { serverId } = (await req.json()) as { serverId: string };
    if (!isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );

    const [member, server] = await Promise.all([
      Member.findOne<IMember>({ user: userId, server: serverId }),
      Server.findById<IServer>(serverId)
    ]);
    if (!server) return NextResponse.json({ message: "Invalid server ID" });
    if (
      !member ||
      member.role !== "owner" ||
      !server.members.some(
        (serverMember) => serverMember.toString() === member.id
      )
    ) {
      return invalidSession();
    }

    const channels: Types.ObjectId[] = [];

    for (let channelGroup of server.channelGroups) {
      for (let channel of channelGroup.channels) {
        channels.push(channel.channel);
      }
    }

    const [deletedServer, deletedMembers] = await Promise.all([
      Server.findByIdAndDelete<IServer>(server.id),
      Member.deleteMany({ server: server.id }),
      User.updateMany(
        { "servers.server": server.id },
        { $pull: { servers: { server: server.id } } }
      ),
      Channel.deleteMany({ server: server.id }),
      Message.deleteMany({
        chatRef: "Channel",
        chat: { $in: channels }
      })
    ]);

    return NextResponse.json({ message: "Server successfully deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
