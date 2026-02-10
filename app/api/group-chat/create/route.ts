import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession,
} from "@/lib/auth";
import { sterilizeClientGroupChat } from "@/lib/groupChat";
import GroupChat, { IGroupChat } from "@/models/GroupChat";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user },
    } = reqSession;

    const { groupChatUsers } = (await req.json()) as {
      groupChatUsers: string[];
    };
    groupChatUsers.push(user.id);

    const members = [];
    for (let groupChatUser of groupChatUsers) {
      if (!isValidObjectId(groupChatUser)) {
        return NextResponse.json(
          { message: "Invalid user(s)" },
          { status: 400 },
        );
      }
      members.push({ user: groupChatUser, unreadMessages: 0 });
    }

    const groupChat = (await GroupChat.create<IGroupChat>({
      members,
    })) as IGroupChat;

    const populatedGroupChat = (await GroupChat.findById<IGroupChat>(
      groupChat.id,
    ).populate<{
      members: { user: IUser; unreadMessages: number }[];
    }>("members.user")) as Omit<IGroupChat, "members"> & {
      members: { user: IUser; unreadMessages: number }[];
    };
    if (!populatedGroupChat) {
      throw new Error("Failed to create group chat");
    }

    await User.updateMany(
      {
        _id: {
          $in: populatedGroupChat.members.map((member) => member.user.id),
        },
      },
      {
        $addToSet: { groupChats: populatedGroupChat.id },
      },
    );

    const pusherPromises = [];
    for (let member of populatedGroupChat.members) {
      pusherPromises.push(
        pusherServer.trigger(
          `private-user-${member.user.id}`,
          "groupChatCreated",
          sterilizeClientGroupChat(populatedGroupChat, member.user.id),
        ),
      );
    }

    await Promise.all(pusherPromises);

    return NextResponse.json({ chatId: populatedGroupChat.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
