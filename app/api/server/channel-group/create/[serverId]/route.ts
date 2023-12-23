import { getSession, invalidSession } from "@/lib/auth";
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
      user: userId,
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
      uiOrder: server.channelGroups.length
    };

    server.channelGroups.push(channelGroup);
    await server.save();

    await pusherServer.trigger(
      `private-server-${server.id}`,
      "channelGroupCreated",
      { channelGroup }
    );

    return NextResponse.json({ message: "Successfully created channel group" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
