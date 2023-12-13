import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
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
