import { getSession, invalidSession } from "@/lib/auth";
import { sterilizeClientGroupChat } from "@/lib/groupChat";
import GroupChat, { IGroupChat } from "@/models/GroupChat";
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

    const { groupChatUsers } = (await req.json()) as {
      groupChatUsers: string[];
    };
    groupChatUsers.push(user.id);
    for (let groupChatUser of groupChatUsers) {
      if (!isValidObjectId(groupChatUser)) {
        return NextResponse.json(
          { message: "Invalid user(s)" },
          { status: 400 }
        );
      }
    }

    const unreadCounts = new Map<string, number>();
    for (let groupChatUser of groupChatUsers) {
      unreadCounts.set(groupChatUser, 0);
    }

    const groupChat = (await GroupChat.create<IGroupChat>({
      members: groupChatUsers,
      unreadCounts
    })) as IGroupChat;

    const populatedGroupChat = (await GroupChat.findById<IGroupChat>(
      groupChat.id
    ).populate<{
      members: IUser[];
    }>("members")) as Omit<IGroupChat, "members"> & { members: IUser[] };
    if (!populatedGroupChat) {
      throw new Error("Failed to create group chat");
    }

    await User.updateMany(
      {
        _id: { $in: populatedGroupChat.members.map((member) => member.id) }
      },
      {
        $addToSet: { groupChats: populatedGroupChat.id }
      }
    );

    const pusherPromises = [];
    for (let member of populatedGroupChat.members) {
      console.log(member.id);
      pusherPromises.push(
        pusherServer.trigger(
          `private-user-${member.id}`,
          "groupChatCreated",
          sterilizeClientGroupChat(populatedGroupChat, member.id)
        )
      );
    }

    await Promise.all(pusherPromises);

    return NextResponse.json({ chatId: populatedGroupChat.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
