import { getSession, getUserProfile, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { MESSAGE_COUNT, getMessages } from "@/lib/message";
import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import Message, { IMessage } from "@/models/Message";
import { IClientMessage } from "@/types/user";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const chatId = req.url.slice(req.url.lastIndexOf("/") + 1);

    const { content } = (await req.json()) as {
      content: string;
    };
    const taggedSessionId = req.cookies.get("session")?.value;
    if (!taggedSessionId) return invalidSession();

    const { query, userType } = getSession(taggedSessionId);
    if (!query || userType !== "verified") return invalidSession();

    await dbConnect();

    const [session, directMessage] = await Promise.all([
      query,
      DirectMessage.findById<IDirectMessage>(chatId)
    ]);
    if (!session) return invalidSession();
    if (
      !directMessage ||
      (directMessage.user1.toString() !== session.user.toString() &&
        directMessage.user2.toString() !== session.user.toString())
    ) {
      return NextResponse.json(
        { message: "Invalid chat ID, message failed to send" },
        { status: 400 }
      );
    }

    await Message.create<IMessage>({
      content,
      sender: session.user,
      chatRef: "DirectMessage",
      chat: directMessage.id
    });

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
  if (!isValidObjectId(lastMessageId))
    return NextResponse.json(
      { message: "Invalid message ID" },
      { status: 400 }
    );

  await dbConnect();
  const lastMessage = await Message.findById(lastMessageId);
  if (!lastMessage)
    return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });

  const messages = await getMessages(chatId, "DirectMessage", lastMessage);

  const clientMessages: IClientMessage[] = messages.map((message) => ({
    content: message.content,
    sender: getUserProfile(message.sender),
    chatId: message.chat.toString(),
    timestamp: message.createdAt,
    id: message.id
  }));

  return NextResponse.json({
    messages: clientMessages,
    noMoreMessages: clientMessages.length < MESSAGE_COUNT
  });
}
