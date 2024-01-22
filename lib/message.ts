import Message, { IMessage } from "@/models/Message";
import { IUser } from "@/models/User";
import { TMessageMedia } from "@/types/message";
import { IClientMessage } from "@/types/user";
import "server-only";
import { getUserProfile } from "./auth";
import dbConnect from "./db";
import { uploadMessageImage, uploadMessageVideo } from "./firebase";

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

export async function createMessageMediaFromFile(
  file: File
): Promise<TMessageMedia | null> {
  const fileType = file.type.split("/")[0];
  if (fileType !== "image" && fileType !== "video" && fileType !== "audio") {
    return null;
  }
  let downloadUrl;
  if (fileType === "image") {
    downloadUrl = await uploadMessageImage(file);
  } else if (fileType === "video") {
    downloadUrl = await uploadMessageVideo(file);
  } else {
    return null;
  }

  return {
    type: fileType,
    mediaUrl: downloadUrl
  };
}
