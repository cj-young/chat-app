import { getSession, getUserProfile, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { receiverUsername, receiverId } = (await req.json()) as {
      receiverUsername?: string;
      receiverId?: string;
    };

    if (!receiverUsername && !receiverId) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query.populate<{
      user: Omit<IUser, "friends" | "blockedUsers"> & {
        friends: IUser[];
        blockedUsers: IUser[];
      };
    }>({
      path: "user",
      model: User,
      populate: ["friends", "blockedUsers"]
    });
    if (!session?.user) return invalidSession();

    if (
      session.user.friends.some(
        (friend) => friend.username === receiverUsername
      )
    ) {
      return NextResponse.json(
        {
          message: `You are already friends with ${receiverUsername}`
        },
        { status: 400 }
      );
    }

    if (session.user.username === receiverUsername) {
      return NextResponse.json(
        { message: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    if (
      session.user.blockedUsers.some(
        (blockedUser) => blockedUser.username === receiverUsername
      )
    ) {
      return NextResponse.json(
        {
          message:
            "You have blocked this user, so you can't add them as a friend"
        },
        { status: 400 }
      );
    }

    let receiverQuery;
    if (receiverId) {
      receiverQuery = { _id: receiverId } as const;
    } else {
      receiverQuery = { username: receiverUsername! } as const;
    }

    const receiver = await User.findOne<IUser>(receiverQuery);
    if (!receiver) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }
    if (
      receiver.blockedUsers.some(
        (blockedUser) => blockedUser.toString() === session.user.id
      )
    ) {
      return NextResponse.json({
        message: `Friend request sent to ${receiver.username}`
      });
    }

    const updatedReceiver = await User.findOneAndUpdate<IUser>(
      receiverQuery,
      {
        $addToSet: {
          friendRequests: session.user
        }
      },
      { new: true }
    );

    if (!updatedReceiver) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    await pusherServer.trigger(
      `private-user-${updatedReceiver.id}`,
      "friendRequest",
      getUserProfile(session.user)
    );

    return NextResponse.json({
      message: `Friend request sent to ${updatedReceiver.username}`
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
