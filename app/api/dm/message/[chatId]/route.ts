import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import {
  MESSAGE_COUNT,
  createMessageMediaFromFile,
  getMessages,
  sterilizeClientMessage
} from "@/lib/message";
import { pusherServer } from "@/lib/pusher";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import Message, { IMessage } from "@/models/Message";
import User, { IUser } from "@/models/User";
import { TMessageMedia } from "@/types/message";
import { IClientMessage } from "@/types/user";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const chatId = req.url.slice(req.url.lastIndexOf("/") + 1);
    const formData = await req.formData();
    const content: string | undefined = formData.get("content") as string;
    const tempId: string | undefined = formData.get("tempId") as string;
    const media = formData.getAll("media") as File[];

    const [reqSession, directMessage] = await Promise.all([
      getReqSession(req),
      DirectMessage.findById<IDirectMessage>(chatId)
    ]);
    if (!isVerifiedReqSession(reqSession) || !directMessage)
      return invalidSession();
    const { session } = reqSession;
    if (
      !directMessage ||
      (directMessage.user1.toString() !== session.user.id &&
        directMessage.user2.toString() !== session.user.id)
    ) {
      return NextResponse.json(
        { message: "Invalid chat ID, message failed to send" },
        { status: 400 }
      );
    }

    const { user } = session;

    const isUser1 = user.id === directMessage.user1;
    const otherUser = await User.findById<IUser>(
      isUser1 ? directMessage.user2 : directMessage.user1
    );
    if (
      !otherUser ||
      otherUser.blockedUsers.some(
        (blockedUserId) => blockedUserId.toString() === user.id
      )
    ) {
      return NextResponse.json(
        { message: "Access denied, message failed to send" },
        { status: 403 }
      );
    }

    const mediaObjects = (
      await Promise.all(media.map(createMessageMediaFromFile))
    ).filter((mediaObject): mediaObject is TMessageMedia => !!mediaObject);

    const message = (await Message.create<IMessage>({
      content,
      sender: session.user.id,
      chatRef: "DirectMessage",
      chat: directMessage.id,
      media: mediaObjects
    })) as IMessage;

    let dmUpdateInfo;
    if (isUser1) {
      dmUpdateInfo = {
        $inc: { user2Unread: 1 }
      };
    } else {
      dmUpdateInfo = {
        $inc: { user1Unread: 1 }
      };
    }

    if (message) {
      if (isUser1) {
      }
      await DirectMessage.findByIdAndUpdate<IDirectMessage>(directMessage.id, {
        latestMessageAt: message.createdAt,
        ...dmUpdateInfo
      });
    }

    const clientMessage = sterilizeClientMessage({
      ...message.toObject(),
      id: message.id,
      sender: user
    });

    await pusherServer.trigger(
      `private-directMessage-${chatId}`,
      "messageSent",
      { message: clientMessage, tempId }
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
  const chatId = url.pathname.slice(url.pathname.lastIndexOf("/") + 1);

  if (!isValidObjectId(chatId))
    return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });
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

  const messages = await getMessages(chatId, "DirectMessage", lastMessage);

  const clientMessages: IClientMessage[] = messages.map(sterilizeClientMessage);

  return NextResponse.json({
    messages: clientMessages,
    noMoreMessages: clientMessages.length < MESSAGE_COUNT
  });
}
