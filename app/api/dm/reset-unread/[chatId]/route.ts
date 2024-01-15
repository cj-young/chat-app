import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import DirectMessage from "@/models/DirectMessage";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const chatId = req.url.slice(req.url.lastIndexOf("/") + 1);
    if (!isValidObjectId(chatId))
      return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });

    await Promise.all([
      DirectMessage.findOneAndUpdate(
        { _id: chatId, user1: user.id },
        { user1Unread: 0 }
      ),
      DirectMessage.findOneAndUpdate(
        { _id: chatId, user2: user.id },
        { user2Unread: 0 }
      )
    ]);

    return NextResponse.json({ message: "Unread messages reset to 0" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
