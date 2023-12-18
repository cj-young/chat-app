import { getSession, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import GroupChat from "@/models/GroupChat";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query;
    if (!session) return invalidSession();

    const { user: userId } = session;

    const chatId = req.url.slice(req.url.lastIndexOf("/") + 1);
    if (!isValidObjectId(chatId))
      return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });

    await GroupChat.findByIdAndUpdate(
      chatId,
      {
        $set: {
          "members.$[elem].unreadMessages": 0
        }
      },
      { arrayFilters: [{ "elem.user": userId }] }
    );

    return NextResponse.json({ message: "Unread messages reset to 0" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
