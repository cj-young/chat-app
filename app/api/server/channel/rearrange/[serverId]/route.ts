import { getSession, invalidSession } from "@/lib/auth";
import { IUser } from "@/models/User";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query.populate<{ user: IUser }>("user");
    if (!session || session.isExpired() || !session.user)
      return invalidSession();

    const { user } = session;

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

    const { channelId, newUiOrder, newGroupId } = (await req.json()) as {
      channelId: string;
      newUiOrder: number;
      newGroupId?: string;
    };

    if (!channelId || !isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid channel ID" },
        { status: 400 }
      );
    if (newUiOrder === undefined)
      return NextResponse.json(
        { message: "UI order not provided" },
        { status: 400 }
      );

    const channelGroup = server.channelGroups.find((channelGroup) =>
      channelGroup.channels.some(
        (channel) => channel.channel.toString() === channelId
      )
    );
    if (!channelGroup) {
      return NextResponse.json(
        { message: "Invalid chanenl ID" },
        { status: 400 }
      );
    }

    const channel = channelGroup.channels.find(
      (channelObject) => channelObject.channel.toString() === channelId
    )!;
    const oldUiOrder = channel.uiOrder;

    if (!newGroupId || channelGroup.id === newGroupId) {
      // Chanenl has been moved within previous group,
      // so no need to edit on server
      const updated = await Server.findByIdAndUpdate(
        server.id,
        {
          $inc: {
            "channelGroups.$[channelGroup].channels.$[case1].uiOrder": -1,
            "channelGroups.$[channelGroup].channels.$[case2].uiOrder": 1
          },
          $set: {
            "channelGroups.$[channelGroup].channels.$[idMatch].uiOrder":
              newUiOrder
          }
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
              "idMatch.channel": channel.channel
            },
            {
              "channelGroup._id": channelGroup.id
            }
          ],
          new: true
        }
      );
    } else {
      const channel = channelGroup.channels.find(
        (channel) => channel.channel.toString() === channelId
      )!;
      const filteredChannels = channelGroup.channels.filter(
        (channel) => channel.channel.toString() !== channelId
      );
      channelGroup.channels = filteredChannels;

      const newGroup = server.channelGroups.find(
        (channelGroup) => channelGroup.id === newGroupId
      );
      if (!newGroup) {
        return NextResponse.json({ message: "Invalid new group" });
      }

      for (let existingChannel of newGroup.channels) {
        if (existingChannel.uiOrder >= newUiOrder) {
          existingChannel.uiOrder++;
        }
      }

      newGroup.channels.push({ channel: channel.channel, uiOrder: newUiOrder });
      await server.save();
    }

    return NextResponse.json({ message: "Successfully rearranged channel" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
