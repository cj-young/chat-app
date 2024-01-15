import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { receiverId } = (await req.json()) as { receiverId: string };
    await Promise.all([
      User.findByIdAndUpdate(user.id, { $pull: { friends: receiverId } }),
      User.findByIdAndUpdate(receiverId, { $pull: { friends: user.id } })
    ]);

    await Promise.all([
      pusherServer.trigger(`private-user-${receiverId}`, "friendRemove", {
        userId: user.id
      }),
      pusherServer.trigger(`private-user-${user.id}`, "friendRemove", {
        userId: receiverId
      })
    ]);

    return NextResponse.json({ message: "Successfully removed friend" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
