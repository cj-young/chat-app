import { getSession, getUserProfile, invalidSession } from "@/lib/auth";
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

    const chatId = req.url.slice(req.url.lastIndexOf("/") + 1);
    if (!isValidObjectId(chatId))
      return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });

    const { userIds } = (await req.json()) as {
      userIds: string[];
    };
    const dbPromises = [];
    const profilePromises = [];
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
      profilePromises.push(User.findById<IUser>(userId));
    }

    const [_dbResults, userProfiles, groupChat] = await Promise.all([
      Promise.all(dbPromises),
      Promise.all(profilePromises),
      GroupChat.findById<IGroupChat>(chatId).populate<{
        members: { user: IUser; unreadMessages: number }[];
      }>("members.user")
    ]);
    const filteredProfiles = userProfiles.filter(
      (user) => user !== null
    ) as IUser[];
    const sterilizedProfiles = filteredProfiles.map((user) =>
      getUserProfile(user)
    );

    const pusherTriggers = [];
    pusherTriggers.push(
      pusherServer.trigger(`private-groupChat-${chatId}`, "usersAdded", {
        users: sterilizedProfiles
      })
    );
    if (groupChat) {
      for (let userId of userIds) {
        pusherTriggers.push(
          pusherServer.trigger(
            `private-user-${userId}`,
            "groupChatCreated",
            sterilizeClientGroupChat(groupChat, userId)
          )
        );
      }
    }
    await Promise.all(pusherTriggers);

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
