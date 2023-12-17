import { getSession, invalidSession } from "@/lib/auth";
import { sterilizeClientDm } from "@/lib/directMessages";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (!query || userType !== "verified") return invalidSession();

    const session = await query.populate<{ user: IUser }>("user");
    if (!session || !session.user) return invalidSession();

    const { user } = session;

    const { receiverId } = (await req.json()) as { receiverId: string };
    if (!isValidObjectId(receiverId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const receiver = await User.findById<IUser>(receiverId);
    if (!receiver) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    const existingDm = await DirectMessage.findOne<IDirectMessage>({
      $or: [
        { user1: user.id, user2: receiverId },
        { user1: receiverId, user2: user.id }
      ]
    });
    if (existingDm) {
      return NextResponse.json({ chatId: existingDm.id });
    }

    const newDm = await DirectMessage.create<IDirectMessage>({
      user1: user.id,
      user2: receiver.id
    });

    await User.findByIdAndUpdate(user.id, {
      $addToSet: { directMessages: newDm.id }
    });

    await pusherServer.trigger(`private-user-${user.id}`, "dmCreated", {
      chatId: newDm.id
    });
    return NextResponse.json({ dmChat: sterilizeClientDm(newDm, user.id) });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
