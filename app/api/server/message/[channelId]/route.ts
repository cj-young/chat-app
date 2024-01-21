import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import { uploadMessageImage } from "@/lib/firebase";
import {
  MESSAGE_COUNT,
  getMessages,
  sterilizeClientMessage
} from "@/lib/message";
import Message, { IMessage } from "@/models/Message";
import Channel, { IChannel } from "@/models/server/Channel";
import Member, { IMember } from "@/models/server/Member";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const channelId = req.url.slice(req.url.lastIndexOf("/") + 1);

    const formData = await req.formData();
    const content: string | undefined = formData.get("content") as string;
    const tempId: string | undefined = formData.get("tempId") as string;
    const media = formData.getAll("media") as File[];

    await dbConnect();

    const [reqSession, channel] = await Promise.all([
      getReqSession(req),
      Channel.findById<IChannel>(channelId)
    ]);

    if (!isVerifiedReqSession(reqSession) || !channel) return invalidSession();

    const { session } = reqSession;

    const member = await Member.findOne<IMember>({
      user: session.user.id,
      server: channel.server
    });

    if (
      !member ||
      !member.channels.some(
        (channel) => channel.channel.toString() === channelId
      )
    ) {
      return NextResponse.json(
        { message: "Invalid chat ID, message failed to send" },
        { status: 400 }
      );
    }

    const images = media.filter((file) => file.type.split("/")[0] === "image");
    const imageUrls = await Promise.all(images.map(uploadMessageImage));

    const message = (await Message.create<IMessage>({
      content,
      sender: session.user.id,
      chatRef: "Channel",
      chat: channel.id,
      media: [
        ...imageUrls.map((url) => ({
          type: "image",
          mediaUrl: url
        }))
      ]
    })) as IMessage;

    if (!message)
      return NextResponse.json(
        { message: "Message failed to send" },
        { status: 500 }
      );

    const clientMessage = sterilizeClientMessage({
      ...message.toObject(),
      id: message.id,
      sender: session.user
    });

    await pusherServer.trigger(
      `private-serverChannel-${channelId}`,
      "messageSent",
      {
        message: clientMessage,
        tempId
      }
    );

    return NextResponse.json({ message: "Message successfully sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Message failed to send" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lastMessageId = url.searchParams.get("lastMessage");
  const channelId = url.pathname.slice(url.pathname.lastIndexOf("/") + 1);

  if (!isValidObjectId(channelId))
    return NextResponse.json(
      { message: "Invalid channel ID" },
      { status: 400 }
    );
  if (lastMessageId !== null && !isValidObjectId(lastMessageId))
    return NextResponse.json(
      { message: "Invalid message ID" },
      { status: 400 }
    );

  await dbConnect();
  let lastMessage: IMessage | undefined;
  if (lastMessageId) {
    const foundMessage = await Message.findById<IMessage>(lastMessageId);
    if (!foundMessage)
      return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });
    lastMessage = foundMessage;
  }

  const messages = await getMessages(channelId, "Channel", lastMessage);

  const clientMessages = messages.map((message) =>
    sterilizeClientMessage(message)
  );

  return NextResponse.json({
    messages: clientMessages,
    noMoreMessages: clientMessages.length < MESSAGE_COUNT
  });
}
