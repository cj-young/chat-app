import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import GroupChat, { IGroupChat } from "@/models/GroupChat";
import Channel, { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channelName = data.get("channel_name") as string;
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return authFailed();

    const { query, userType } = getSession(sessionId);
    if (!query || userType !== "verified") return authFailed();
    const session = await query;
    if (!session) return authFailed();

    const splitChannel = channelName.split("-");
    if (splitChannel[0] === "private") {
      if (splitChannel[1] === "directMessage") {
        const chatId = splitChannel[2];
        if (await isDmAuthorized(chatId, session.user.toString())) {
          return NextResponse.json(authResponse);
        } else {
          return authFailed();
        }
      } else if (splitChannel[1] === "user") {
        const userId = splitChannel[2];
        if (userId === session.user.toString()) {
          return NextResponse.json(authResponse);
        } else {
          return authFailed();
        }
      } else if (splitChannel[1] === "groupChat") {
        const chatId = splitChannel[2];
        if (await isGroupChatAuthorized(chatId, session.user.toString())) {
          return NextResponse.json(authResponse);
        } else {
          return authFailed();
        }
      } else if (splitChannel[1] === "serverChannel") {
        const channelId = splitChannel[2];
        if (
          await isServerChannelAuthorized(channelId, session.user.toString())
        ) {
          return NextResponse.json(authResponse);
        } else {
          return authFailed();
        }
      } else if (splitChannel[1] === "server") {
        const serverId = splitChannel[2];
        if (await isServerAuthorized(serverId, session.user.toString())) {
          return NextResponse.json(authResponse);
        } else {
          return authFailed();
        }
      }
    }

    return NextResponse.json({}, { status: 403 });
  } catch (error) {
    console.error(error);
    return authFailed();
  }
}

function authFailed() {
  return NextResponse.json({}, { status: 403 });
}

async function isDmAuthorized(
  chatId: string,
  userId: string
): Promise<boolean> {
  if (!isValidObjectId(chatId)) return false;

  await dbConnect();

  const dmChat = await DirectMessage.findById<IDirectMessage>(chatId);
  if (!dmChat) return false;

  return (
    userId === dmChat.user1.toString() || userId === dmChat.user2.toString()
  );
}

async function isGroupChatAuthorized(chatId: string, userId: string) {
  if (!isValidObjectId(chatId)) return false;

  await dbConnect();

  const groupChat = await GroupChat.findById<IGroupChat>(chatId);
  if (!groupChat) return false;
  return groupChat.members.some((member) => member.user.toString() === userId);
}

async function isServerChannelAuthorized(channelId: string, userId: string) {
  if (!isValidObjectId(channelId)) return false;

  await dbConnect();

  const channel = await Channel.findById<IChannel>(channelId);
  if (!channel) return false;

  const member = await Member.findOne<IMember>({
    server: channel.server,
    user: userId
  });
  if (!member) return false;
  return member.channels.some(
    (channel) => channel.channel.toString() === channelId
  );
}

async function isServerAuthorized(serverId: string, userId: string) {
  if (!isValidObjectId(serverId)) return false;

  await dbConnect();

  const server = await Server.findById<IServer>(serverId);
  if (!server) return false;

  const member = await Member.findOne<IMember>({
    server: serverId,
    user: userId
  });
  if (!member) return false;

  return server.members.some(
    (serverMember) => serverMember.toString() === member.id
  );
}
