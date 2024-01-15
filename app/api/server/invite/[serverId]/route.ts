import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import { getInviteLink } from "@/lib/server";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

const INVITE_CODE_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function GET(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json({ message: "Invalid server ID" });
    const [server, member] = await Promise.all([
      Server.findById<IServer>(serverId),
      Member.findOne<IMember>({ user: user.id, server: serverId })
    ]);
    if (!server) return NextResponse.json({ message: "Invalid server ID" });
    if (!member) return invalidSession();

    if (
      !server.members.some(
        (serverMember) => serverMember.toString() === member.id
      )
    )
      return invalidSession();

    if (!server.isInviteExpired()) {
      const inviteLink = getInviteLink(server.inviteCode.code);
      return NextResponse.json({ inviteLink });
    }

    const code = v4();
    await Server.findByIdAndUpdate(server.id, {
      inviteCode: {
        code,
        expiresAt: new Date(Date.now() + INVITE_CODE_EXPIRY_TIME)
      }
    });

    const inviteLink = getInviteLink(code);
    return NextResponse.json({ inviteLink });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
