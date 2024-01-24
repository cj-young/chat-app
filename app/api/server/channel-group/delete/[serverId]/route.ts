import { getReqSession, invalidSession, serverError } from "@/lib/auth";
import Member, { IMember } from "@/models/server/Member";
import Server from "@/models/server/Server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!reqSession) return invalidSession();
    const { userType, session } = reqSession;
    if (userType !== "verified") return invalidSession();
    const { user } = session;

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    const { groupId } = (await req.json()) as { groupId: string };
    if (!groupId)
      return NextResponse.json(
        { message: "Invalid group ID" },
        { status: 400 }
      );

    const member = await Member.findOne<IMember>({
      user: user.id,
      server: serverId
    });

    if (!member || (member.role !== "admin" && member.role !== "owner"))
      return invalidSession();

    await Server.findByIdAndUpdate(serverId, {
      $pull: {
        channelGroups: {
          _id: groupId
        }
      }
    });

    return NextResponse.json({ message: "Successfully deleted channel group" });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
