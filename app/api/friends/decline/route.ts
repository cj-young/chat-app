import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { receiverId } = (await req.json()) as { receiverId: string };

    const sender = await User.findByIdAndUpdate<IUser>(user.id, {
      $pull: { friendRequests: receiverId }
    });

    return NextResponse.json({
      message: "Successfully declined friend request"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
