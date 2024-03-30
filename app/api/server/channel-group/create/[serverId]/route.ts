import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import { addChannelGroup } from "@/lib/server";
import Member, { IMember } from "@/models/server/Member";
import { isValidObjectId } from "mongoose";
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

    const { channelGroup, server, error } = await addChannelGroup(
      serverId,
      name
    );
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

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
