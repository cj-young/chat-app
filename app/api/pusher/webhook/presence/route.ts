import { getUserProfile } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import Channel, { IChannel } from "@/models/server/Channel";
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
    } else if (
      typeof data.events[0].channel === "string" &&
      data.events[0].channel.startsWith("presence-voice-")
    ) {
      const splitChannel = data.events[0].channel.split("-");
      const callId = splitChannel[2];

      if (data.events[0].name === "member_added") {
        const userId = data.events[0].user_id;
        if (!isValidObjectId(userId)) {
          return NextResponse.json(
            { message: "Invalid user ID" },
            { status: 400 }
          );
        }
        const [user, channel] = await Promise.all([
          User.findById<IUser>(userId),
          Channel.findById<IChannel>(callId)
        ]);
        if (!user) {
          return NextResponse.json(
            { message: "Invalid user ID" },
            { status: 400 }
          );
        }

        if (!channel) {
          return NextResponse.json(
            { message: "Invalid call ID" },
            { status: 400 }
          );
        }

        if (channel.channelType === "voice") {
          await pusherServer.trigger(
            `private-server-${channel.server.toString()}`,
            "userJoinedVoiceCall",
            { channelId: channel.id, user: getUserProfile(user) }
          );
        }
      } else if (data.events[0].name === "member_removed") {
        const userId = data.events[0].user_id;
        const channel = await Channel.findById<IChannel>(callId);

        if (!channel) {
          return NextResponse.json(
            { message: "Invalid call ID" },
            { status: 400 }
          );
        }

        if (channel.channelType === "voice") {
          await pusherServer.trigger(
            `private-server-${channel.server.toString()}`,
            "userLeftVoiceCall",
            { channelId: channel.id, userId }
          );
        }
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
