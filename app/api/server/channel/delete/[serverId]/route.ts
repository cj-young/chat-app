import { getReqSession, invalidSession, serverError } from "@/lib/auth";
import Channel from "@/models/server/Channel";
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
    const { channelId } = (await req.json()) as { channelId: string };
    if (!channelId)
      return NextResponse.json(
        { message: "Invalid channel ID" },
        { status: 400 }
      );

    const member = await Member.findOne<IMember>({
      user: user.id,
      server: serverId
    });

    if (!member || (member.role !== "admin" && member.role !== "owner"))
      return invalidSession();

    console.log(channelId);
    await Server.findByIdAndUpdate(serverId, {
      $pull: {
        "channelGroups.$[].channels": {
          channel: channelId
        }
      }
    });

    await Channel.findByIdAndDelete(channelId);

    return NextResponse.json({ message: "Successfully deleted channel" });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
