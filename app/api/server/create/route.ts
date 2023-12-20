import { getSession, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { uploadServerImage } from "@/lib/firebase";
import User, { IUser } from "@/models/User";
import Channel, { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import Server, { IServer } from "@/models/server/Server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query;
    if (!session?.user) return invalidSession();

    const { user: userId } = session;

    const formData = await req.formData();
    const serverImage: File | undefined = formData.get("serverImage") as File;

    let imageUrl;
    if (serverImage) {
      imageUrl = await uploadServerImage(serverImage);
    }

    const serverName: string | null = formData.get("serverName") as string;
    if (!serverName)
      return NextResponse.json(
        { message: "No server name provided" },
        { status: 400 }
      );
    const server = (await Server.create({
      name: serverName,
      imageUrl
    })) as IServer;

    const user = await User.findById<IUser>(userId);
    if (!user)
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    user.servers.push({
      server: server.id,
      uiOrder: user.servers.length
    });
    await user.save();

    const member = await Member.create<IMember>({
      user: user.id,
      server: server.id,
      role: "owner"
    });

    const defaultChannel = (await Channel.create({
      server: server.id,
      name: "public",
      channelType: "text"
    })) as IChannel;

    await Server.findByIdAndUpdate(server.id, {
      $push: {
        channelGroups: {
          name: "Text Channels",
          channels: [{ channel: defaultChannel.id, uiOrder: 0 }],
          uiOrder: 0
        },
        members: member.id
      }
    });

    return NextResponse.json({ message: "Sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
