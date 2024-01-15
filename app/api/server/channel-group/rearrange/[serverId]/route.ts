import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const serverId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );

    const [server, member] = await Promise.all([
      Server.findById<IServer>(serverId),
      Member.findOne<IMember>({ user: user.id, server: serverId })
    ]);
    if (!server) return NextResponse.json({ message: "Invalid server ID" });
    if (!member || (member.role !== "admin" && member.role !== "owner"))
      return invalidSession();

    if (
      !server.members.some(
        (serverMember) => serverMember.toString() === member.id
      )
    )
      return invalidSession();
    if (!isValidObjectId(serverId))
      return NextResponse.json({ message: "Invalid server ID" });

    const { channelGroupId, newUiOrder } = (await req.json()) as {
      channelGroupId: string;
      newUiOrder: number;
    };
    if (!channelGroupId || !isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid channel group ID" },
        { status: 400 }
      );
    if (newUiOrder === undefined)
      return NextResponse.json(
        { message: "UI order not provided" },
        { status: 400 }
      );

    const groupObject = server.channelGroups.find(
      (channelGroup) => channelGroup.id === channelGroupId
    );
    if (!groupObject)
      return NextResponse.json(
        { message: "Invalid channel group ID" },
        { status: 400 }
      );
    const oldUiOrder = groupObject.uiOrder;

    const updated = await Server.findByIdAndUpdate(
      server.id,
      {
        $inc: {
          "channelGroups.$[case1].uiOrder": -1,
          "channelGroups.$[case2].uiOrder": 1
        },
        $set: { "channelGroups.$[idMatch].uiOrder": newUiOrder }
      },
      {
        arrayFilters: [
          {
            "case1.uiOrder": {
              $gt: oldUiOrder,
              $lte: newUiOrder
            }
          },
          {
            "case2.uiOrder": {
              $lt: oldUiOrder,
              $gte: newUiOrder
            }
          },
          {
            "idMatch._id": groupObject.id
          }
        ],
        new: true
      }
    );
    return NextResponse.json({
      message: "Successfully rearranged channel group"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
