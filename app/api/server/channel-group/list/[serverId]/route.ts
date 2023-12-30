import { getSession, invalidSession } from "@/lib/auth";
import { getMember, getServer, sterilizeClientChannel } from "@/lib/server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { userType, query } = getSession(sessionId);
    if (!query || userType !== "verified") return invalidSession();

    const session = await query;
    if (!session || session.isExpired()) return invalidSession();

    const { user: userId } = session;

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );

    const [server, member] = await Promise.all([
      getServer(serverId),
      getMember(serverId, userId.toString())
    ]);
    if (!member || !server) return invalidSession();

    const channelGroups = server.channelGroups.map((group) => ({
      channels: group.channels.map((channel) =>
        sterilizeClientChannel(channel.channel, channel.uiOrder)
      ),
      name: group.name,
      uiOrder: group.uiOrder
    }));

    console.log(channelGroups);
    return NextResponse.json({ channelGroups });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
