import { getSession, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query.populate<{ user: IUser }>("user");
    if (!session || session.isExpired()) return invalidSession();

    const { user } = session;

    const channelId = req.nextUrl.pathname.slice(
      req.nextUrl.pathname.lastIndexOf("/") + 1
    );

    const { sdp, receiverId } = (await req.json()) as {
      sdp: RTCSessionDescription;
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

    await pusherServer.trigger(`private-user-${receiverId}`, "rtcPeerOffer", {
      sdp,
      userId: user.id
    });

    return NextResponse.json({ message: "Offer sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
