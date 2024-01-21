import Message, { IMessage } from "@/models/Message";
import { IUser } from "@/models/User";
import { IClientMessage } from "@/types/user";
import { getUserProfile } from "./auth";
import dbConnect from "./db";

export const MESSAGE_COUNT = 64;

export async function getMessages(
  chatId: string,
  chatRef: string,
  lastMessage?: IMessage
) {
  await dbConnect();

  const query: any = {
    chatRef,
    chat: chatId
  };

  if (lastMessage) {
    query.$or = [
      { createdAt: { $lt: lastMessage.createdAt } },
      { createdAt: lastMessage.createdAt, _id: { $lt: lastMessage.id } }
    ];
  }

  return await Message.find<IMessage>(query)
    .populate<{ sender: IUser }>("sender")
    // Sort by ID in case multiple documents have the same timestamp
    .sort([
      ["createdAt", "desc"],
      ["_id", "desc"]
    ])
    .limit(MESSAGE_COUNT);
}

export function sterilizeClientMessage(
  message: Pick<
    Omit<IMessage, "sender"> & { sender: IUser },
    "content" | "sender" | "chat" | "createdAt" | "id" | "media"
  >
): IClientMessage {
  return {
    content: message.content,
    sender: getUserProfile(message.sender),
    chatId: message.chat.toString(),
    timestamp: message.createdAt,
    id: message.id,
    media: message.media
  };
}
