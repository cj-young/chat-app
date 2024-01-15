import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import GroupChat, { IGroupChat } from "@/models/GroupChat";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const [groupChat, _updatedUser] = await Promise.all([
      GroupChat.findByIdAndUpdate<IGroupChat>(
        chatId,
        {
          $pull: { members: { user: user.id } }
        },
        { new: true }
      ),
      User.findByIdAndUpdate<IUser>(user.id, { $pull: { groupChats: chatId } })
    ]);
    if (!groupChat)
      return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });

    await pusherServer.trigger(
      `private-user-${user.id}`,
      "leftGroupChat",
      groupChat.id
    );

    if (groupChat) {
      await pusherServer.trigger(
        `private-groupChat-${groupChat.id}`,
        "userLeft",
        user.id
      );
    }

    // Delete group chat if no members remain
    if (groupChat.members.length === 0) {
      await GroupChat.findByIdAndDelete(groupChat.id);
    }

    return NextResponse.json({ message: "Successfully left group chat" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
