import {
  getReqSession,
  getUserProfile,
  invalidSession,
  isVerifiedReqSession,
  serverError
} from "@/lib/auth";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { blockedUserId } = (await req.json()) as { blockedUserId: string };
    if (!isValidObjectId(blockedUserId))
      return NextResponse.json(
        { message: "Invalid blocked user ID" },
        { status: 400 }
      );

    const blockedUser = await User.findById<IUser>(blockedUserId);
    if (!blockedUser)
      return NextResponse.json(
        { message: "Invalid blocked user ID" },
        { status: 400 }
      );

    await User.findByIdAndUpdate(user.id, {
      $addToSet: {
        blockedUsers: blockedUser.id
      }
    });

    return NextResponse.json({ user: getUserProfile(blockedUser) });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
