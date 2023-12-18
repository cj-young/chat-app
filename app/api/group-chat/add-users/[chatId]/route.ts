import { getSession, invalidSession } from "@/lib/auth";
import GroupChat from "@/models/GroupChat";
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

    const chatId = req.url.slice(req.url.lastIndexOf("/") + 1);
    if (!isValidObjectId(chatId))
      return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });

    const { userIds } = (await req.json()) as {
      userIds: string[];
    };
    const dbPromises = [];
    for (let userId of userIds) {
      if (!isValidObjectId(userId)) continue;
      dbPromises.push(
        GroupChat.findOneAndUpdate(
          { _id: chatId, "members.user": { $ne: userId } },
          {
            $addToSet: {
              members: { user: userId, unreadMessages: 0 }
            }
          }
        )
      );
      dbPromises.push(
        User.findByIdAndUpdate(userId, {
          $push: {
            groupChats: chatId
          }
        })
      );
    }
    await Promise.all(dbPromises);

    return NextResponse.json({
      message: "Successfully added user to the group chat"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
