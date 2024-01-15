import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { Types, isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;
    const { name } = (await req.json()) as {
      name: string;
    };

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );

    const member = await Member.findOne<IMember>({
      user: user.id,
      server: serverId
    });
    if (!member || !(member.role === "admin" || member.role === "owner"))
      return invalidSession();

    const server = await Server.findById<IServer>(serverId);
    if (!server)
      return NextResponse.json({ message: "Invalid server" }, { status: 400 });

    const channelGroup = {
      name,
      channels: [],
      uiOrder: server.channelGroups.length,
      _id: new Types.ObjectId()
    };

    server.channelGroups.push(channelGroup);
    await server.save();

    await pusherServer.trigger(
      `private-server-${server.id}`,
      "channelGroupCreated",
      { channelGroup: { ...channelGroup, id: channelGroup._id } }
    );

    return NextResponse.json({ message: "Successfully created channel group" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
