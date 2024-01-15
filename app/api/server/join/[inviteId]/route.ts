import {
  getReqSession,
  getUserProfile,
  isVerifiedReqSession
} from "@/lib/auth";
import User, { IUser } from "@/models/User";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { IClientMember } from "@/types/server";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return joinFailed();
    const {
      session: { user }
    } = reqSession;

    const inviteId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    const server = await Server.findOne<IServer>({
      "inviteCode.code": inviteId
    });
    if (!server) return joinFailed();
    if (server.members.some((member) => member.toString() === user.id)) {
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
      user: user.id,
      server: server.id,
      role: "guest",
      channels: channels.map((channel) => ({ channel, unreadMessages: 0 }))
    })) as IMember;

    if (!member) return joinFailed();

    await Server.findByIdAndUpdate(server.id, {
      $addToSet: { members: member.id }
    });

    const workingUser = await User.findById<IUser>(user.id);
    if (!workingUser) return joinFailed();

    if (
      !workingUser.servers.some(
        (prevServer) => prevServer.server.toString() === server.id
      )
    ) {
      workingUser.servers.push({
        server: server.id,
        uiOrder: workingUser.servers.length
      });
      await workingUser.save();
    }

    const clientMember: IClientMember = {
      role: member.role,
      user: getUserProfile(workingUser),
      id: member.id
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
