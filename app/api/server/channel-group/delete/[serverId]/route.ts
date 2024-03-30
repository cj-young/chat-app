import { getReqSession, invalidSession, serverError } from "@/lib/auth";
import {
  addChannel,
  addChannelGroup,
  sterilizeClientChannel
} from "@/lib/server";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
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

    const updatedServer = await Server.findByIdAndUpdate<IServer>(
      serverId,
      {
        $pull: {
          channelGroups: {
            _id: groupId
          }
        }
      },
      { new: true }
    );

    if (updatedServer?.channelGroups.length === 0) {
      // Create channel new channel group if final one was deleted
      const {
        server,
        channelGroup,
        error: groupError
      } = await addChannelGroup(updatedServer.id, "Text Channels");
      if (groupError) {
        return NextResponse.json({ message: groupError }, { status: 400 });
      }

      const {
        channel,
        channelUiOrder,
        error: channelError
      } = await addChannel(
        server.id,
        channelGroup._id.toString(),
        "public",
        "text"
      );
      if (channelError) {
        return NextResponse.json({ message: channelError }, { status: 400 });
      }

      await pusherServer.trigger(
        `private-server-${server.id}`,
        "channelGroupCreated",
        { channelGroup: { ...channelGroup, id: channelGroup._id } }
      );
      const clientChannel = sterilizeClientChannel(
        channel,
        channelUiOrder ?? 0
      );
      await pusherServer.trigger(
        `private-server-${server.id}`,
        "channelCreated",
        {
          channel: clientChannel,
          groupId: channelGroup._id
        }
      );
    } else if (
      updatedServer?.channelGroups.flatMap((group) => group.channels).length ===
      0
    ) {
      // The only remaining channel was deleted, so one must be added
      let firstGroupId: string | undefined = updatedServer.channelGroups[0]?.id;
      if (!firstGroupId) {
        const { channelGroup, error } = await addChannelGroup(
          updatedServer.id,
          "Text Channels"
        );
        if (error) {
          return NextResponse.json({ message: error }, { status: 400 });
        }

        firstGroupId = channelGroup._id.toString();
        await pusherServer.trigger(
          `private-server-${updatedServer.id}`,
          "channelGroupCreated",
          { channelGroup: { ...channelGroup, id: channelGroup._id } }
        );
      }

      const {
        channel: newChannel,
        channelUiOrder: newChannelUiOrder,
        error
      } = await addChannel(updatedServer.id, firstGroupId, "public", "text");
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }

      const clientChannel = sterilizeClientChannel(
        newChannel,
        newChannelUiOrder ?? 0
      );
      await pusherServer.trigger(
        `private-server-${updatedServer.id}`,
        "channelCreated",
        {
          channel: clientChannel,
          groupId: firstGroupId
        }
      );
    }

    return NextResponse.json({ message: "Successfully deleted channel group" });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
