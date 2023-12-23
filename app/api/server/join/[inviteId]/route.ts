import { getSession, getUserProfile } from "@/lib/auth";
import User, { IUser } from "@/models/User";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { IClientMember } from "@/types/server";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return joinFailed();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return joinFailed();

    const session = await query;
    if (!session?.user) return joinFailed();
    const { user: userId } = session;

    const inviteId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    const server = await Server.findOne<IServer>({
      "inviteCode.code": inviteId
    });
    if (!server) return joinFailed();
    if (
      server.members.some((member) => member.toString() === userId.toString())
    ) {
      return NextResponse.redirect(
        new URL(`/server/${server.id}`, process.env.BASE_URL)
      );
    }

    const channels: Types.ObjectId[] = [];
    for (let group of server.channelGroups) {
      for (let channel of group.channels) {
        channels.push(channel.channel);
      }
    }

    const member = (await Member.create({
      user: userId,
      server: server.id,
      role: "guest",
      channels: channels.map((channel) => ({ channel, unreadMessages: 0 }))
    })) as IMember;

    if (!member) return joinFailed();

    await Server.findByIdAndUpdate(server.id, {
      $addToSet: { members: member.id }
    });

    const user = await User.findById<IUser>(userId);
    if (!user) return joinFailed();

    if (
      !user.servers.some(
        (prevServer) => prevServer.server.toString() === server.id
      )
    ) {
      user.servers.push({ server: server.id, uiOrder: user.servers.length });
      await user.save();
    }

    const clientMember: IClientMember = {
      role: member.role,
      user: getUserProfile(user)
    };
    await pusherServer.trigger(
      `private-server-${server.id}`,
      "userJoined",
      clientMember
    );

    return NextResponse.redirect(
      new URL(`/server/${server.id}`, process.env.BASE_URL)
    );
  } catch (error) {
    console.error(error);
    return joinFailed();
  }
}

function joinFailed() {
  return NextResponse.redirect(new URL("/", process.env.BASE_URL));
}
