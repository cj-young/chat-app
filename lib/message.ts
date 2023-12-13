import Message, { IMessage } from "@/models/Message";
import { IUser } from "@/models/User";
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
    query.createdAt = { $lte: lastMessage.createdAt };
    query._id = { $lt: lastMessage.id };
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
