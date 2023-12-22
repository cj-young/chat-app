import { getSession, invalidSession } from "@/lib/auth";
import User from "@/models/User";
import Member, { IMember } from "@/models/server/Member";
import Server from "@/models/server/Server";
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
    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );

    if (!isValidObjectId(serverId))
      return NextResponse.json({ message: "Invalid server ID" });
    const member = await Member.findOneAndDelete<IMember>({
      user: userId,
      server: serverId
    });
    if (!member) return invalidSession();

    await Server.findByIdAndUpdate(serverId, { $pull: { members: member.id } });
    await User.findByIdAndUpdate(userId, {
      $pull: { servers: { server: serverId } }
    });

    return NextResponse.json({ message: "Successfull left server" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
