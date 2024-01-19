import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession,
  serverError
} from "@/lib/auth";
import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { unblockedUserId } = (await req.json()) as {
      unblockedUserId: string;
    };
    if (!isValidObjectId(unblockedUserId))
      return NextResponse.json(
        { message: "Invalid unblocked user ID" },
        { status: 400 }
      );

    await User.findByIdAndUpdate(user.id, {
      $pull: {
        blockedUsers: unblockedUserId
      }
    });

    return NextResponse.json({ message: "Successfully unblocked user" });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
