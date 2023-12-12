import Message, { IMessage } from "@/models/Message";
import { IUser } from "@/models/User";
import dbConnect from "./db";

const MESSAGE_COUNT = 40;

export async function getInitialMessages(chatId: string, chatRef: string) {
  await dbConnect();
  return await Message.find<IMessage>({
    chatRef,
    chat: chatId
  })
    .populate<{ sender: IUser }>("sender")
    // Sort by ID in case multiple documents have the same timestamp
    .sort([
      ["createdAt", "desc"],
      ["_id", "desc"]
    ])
    .limit(MESSAGE_COUNT);
}
