import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import { addChannel, sterilizeClientChannel } from "@/lib/server";
import Member, { IMember } from "@/models/server/Member";
import { TChannelType } from "@/types/server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;
    const { channelType, name, groupId } = (await req.json()) as {
      channelType: TChannelType;
      name: string;
      groupId: string;
    };

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );
    if (!isValidObjectId(serverId))
      return NextResponse.json({ message: "Invalid server ID" });

    const member = await Member.findOne<IMember>({
      user: user.id,
      server: serverId
    });
    if (!member || !(member.role === "admin" || member.role === "owner"))
      return invalidSession();

    const { channel, channelUiOrder, server, error } = await addChannel(
      serverId,
      groupId,
      name,
      channelType
    );
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const clientChannel = sterilizeClientChannel(channel, channelUiOrder ?? 0);
    await pusherServer.trigger(
      `private-server-${server.id}`,
      "channelCreated",
      {
        channel: clientChannel,
        groupId: groupId
      }
    );

    return NextResponse.json({ message: "Successfully created channel" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
