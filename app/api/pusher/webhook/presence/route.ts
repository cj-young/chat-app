import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await dbConnect();

    if (data.events[0].channel === "presence-app") {
      if (data.events[0].name === "member_added") {
        const userId = data.events[0].user_id;
        if (!isValidObjectId(userId)) {
          return NextResponse.json(
            { message: "Invalid user ID" },
            { status: 400 }
          );
        }
        const user = await User.findByIdAndUpdate<IUser>(userId, {
          isOnline: true
        });
        if (!user) {
          return NextResponse.json(
            { message: "Invalid user ID" },
            { status: 400 }
          );
        }

        const newOnlineStatus =
          user.preferredOnlineStatus === "invisible"
            ? "offline"
            : user.preferredOnlineStatus;

        await pusherServer.trigger(
          `profile-${user.id}`,
          "onlineStatusChanged",
          { onlineStatus: newOnlineStatus }
        );
      } else if (data.events[0].name === "member_removed") {
        const userId = data.events[0].user_id;
        console.log("USER ID");
        console.log(userId);
        if (!isValidObjectId(userId)) {
          return NextResponse.json(
            { message: "Invalid user ID" },
            { status: 400 }
          );
        }

        const user = await User.findByIdAndUpdate<IUser>(userId, {
          isOnline: false
        });
        if (!user) {
          return NextResponse.json(
            { message: "Invalid user ID" },
            { status: 400 }
          );
        }

        await pusherServer.trigger(
          `profile-${user.id}`,
          "onlineStatusChanged",
          { onlineStatus: "offline" }
        );
      }
    }

    return NextResponse.json({ message: "webhook response" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
