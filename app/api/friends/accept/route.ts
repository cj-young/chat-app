import { getSession, getUserProfile, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sterilizeClientDm } from "@/lib/directMessages";
import { pusherServer } from "@/lib/pusher";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query.populate<{ user: IUser }>("user");
    if (!session?.user) return invalidSession();
    const { user } = session;

    const { receiverId } = (await req.json()) as { receiverId: string };

    if (user.id === receiverId) {
      return NextResponse.json({
        message: "You cannot add yourself as a friend"
      });
    }

    const dmChat = await DirectMessage.findOneAndUpdate<IDirectMessage>(
      {
        $or: [
          { user1: receiverId, user2: user.id },
          { user1: user.id, user2: receiverId }
        ]
      },
      {
        user1: user.id,
        user2: receiverId,
        latestMessageAt: Date.now()
      },
      { upsert: true, new: true }
    )
      .populate<{ user1: IUser }>("user1")
      .populate<{ user2: IUser }>("user2");

    const [sender, receiver] = await Promise.all([
      User.findByIdAndUpdate<IUser>(receiverId, {
        $addToSet: { friends: user.id, directMessages: dmChat.id }
      }),
      User.findByIdAndUpdate<IUser>(user.id, {
        $addToSet: { friends: receiverId, directMessages: dmChat.id },
        $pull: { friendRequests: receiverId }
      })
    ]);

    if (receiver && sender) {
      pusherServer.trigger(`private-user-${receiver.id}`, "friendAccept", {
        user: getUserProfile(sender),
        dmChat: sterilizeClientDm(dmChat, receiver.id)
      });
      pusherServer.trigger(`private-user-${sender.id}`, "friendAccept", {
        user: getUserProfile(receiver),
        dmChat: sterilizeClientDm(dmChat, sender.id)
      });
    }

    return NextResponse.json({ message: "Successfull added friend" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
