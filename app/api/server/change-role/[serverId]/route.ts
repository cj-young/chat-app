import { getReqSession, invalidSession, serverError } from "@/lib/auth";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { TRole } from "@/types/server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!reqSession || reqSession.userType !== "verified")
      return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { memberToEditId, newRole } = (await req.json()) as {
      memberToEditId: string;
      newRole: TRole;
    };
    if (newRole === "owner")
      return NextResponse.json(
        { message: "You cannot change a member's role to owner" },
        { status: 400 }
      );
    if (!memberToEditId)
      return NextResponse.json({ message: "No member provided" });

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );

    const [server, member] = await Promise.all([
      Server.findById<IServer>(serverId),
      Member.findOne<IMember>({ user: user.id, server: serverId })
    ]);

    if (!server)
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );
    if (!member || member.role !== "owner") return invalidSession();

    await Member.findByIdAndUpdate(memberToEditId, {
      role: newRole
    });

    return NextResponse.json({ message: "Successfully updated member's role" });
  } catch (error) {
    return serverError();
  }
}
