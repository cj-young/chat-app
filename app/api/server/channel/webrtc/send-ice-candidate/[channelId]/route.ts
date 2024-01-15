import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const channelId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );

    const { candidate, receiverId } = (await req.json()) as {
      candidate: RTCIceCandidate;
      receiverId: string;
    };

    const membersResult = await pusherServer.get({
      path: `/channels/presence-voice-${channelId}/users`
    });
    if (!membersResult.ok) {
      return invalidSession();
    }
    const presenceChannelMembers = (await membersResult.json()) as {
      users: { id: string }[];
    };
    if (!presenceChannelMembers.users.some((member) => member.id === user.id)) {
      return invalidSession();
    }

    await pusherServer.trigger(
      `private-user-${receiverId}`,
      "rtcIceCandidateSent",
      {
        candidate,
        userId: user.id
      }
    );

    return NextResponse.json({ message: "Answer sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
