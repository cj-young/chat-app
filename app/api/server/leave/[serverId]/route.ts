import { getSession, invalidSession } from "@/lib/auth";
import { serverRolePriorities } from "@/lib/clientUtils";
import User from "@/models/User";
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

    const [server, _user] = await Promise.all([
      Server.findByIdAndUpdate<IServer>(serverId, {
        $pull: { members: member.id }
      }).populate<{ members: IMember[] }>("members"),
      await User.findByIdAndUpdate(userId, {
        $pull: { servers: { server: serverId } }
      })
    ]);

    if (!server)
      return NextResponse.json(
        { message: "Server not found" },
        { status: 400 }
      );
    const highestPermissionUser = getHighestPermissionUser(server.members);
    if (highestPermissionUser) {
      await Member.findByIdAndUpdate(highestPermissionUser.id, {
        role: "owner"
      });
    }

    await Promise.all([
      pusherServer.trigger(`private-server-${server.id}`, "userLeft", {
        memberId: member.id
      }),
      pusherServer.trigger(`private-user-${userId}`, "serverRemoved", {
        serverId: server.id
      })
    ]);

    return NextResponse.json({ message: "Successfull left server" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function getHighestPermissionUser(members: IMember[]): IMember | null {
  if (members.length === 0) return null;
  return members.reduce((prevHighest, curr) => {
    const prevRolePriority =
      serverRolePriorities.get(curr.role) ?? Number.MAX_VALUE;
    const currRolePriority =
      serverRolePriorities.get(prevHighest.role) ?? Number.MAX_VALUE;

    if (currRolePriority < prevRolePriority) {
      return curr;
    } else if (
      prevRolePriority === currRolePriority &&
      curr.createdAt.getTime() < prevHighest.createdAt.getTime()
    ) {
      return curr;
    } else {
      return prevHighest;
    }
  }, members[0]);
}
