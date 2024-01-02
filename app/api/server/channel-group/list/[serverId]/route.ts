import { getSession, getUserProfile, invalidSession } from "@/lib/auth";
import { getMember, getServer, sterilizeClientChannel } from "@/lib/server";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );

    const [server, member] = await Promise.all([
      getServer(serverId),
      getMember(serverId, userId.toString())
    ]);
    if (!member || !server) return invalidSession();

    const channelGroups = server.channelGroups.map((group) => ({
      channels: group.channels.map((channel) =>
        sterilizeClientChannel(channel.channel, channel.uiOrder)
      ),
      name: group.name,
      uiOrder: group.uiOrder,
      id: group.id
    }));

    const memberPromises = [];

    for (let channelGroup of channelGroups) {
      for (let channel of channelGroup.channels) {
        if (channel.type === "voice") {
          const membersPromise = pusherServer
            .get({
              path: `/channels/presence-voice-${channel.channelId}/users`
            })
            .then(
              (res) =>
                res.json() as Promise<{
                  users: { id: string }[];
                }>
            )
            .then(({ users }) =>
              Promise.all(users.map((user) => User.findById<IUser>(user.id)))
            )
            .then((users) => {
              const filteredUsers = users.filter(
                (user): user is IUser => user !== null
              );
              channel.callMembers = filteredUsers.map((user) =>
                getUserProfile(user)
              );
            });
          memberPromises.push(membersPromise);
        }
      }
    }

    await Promise.all(memberPromises);
    return NextResponse.json({ channelGroups });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
