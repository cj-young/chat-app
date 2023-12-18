import { IGroupChat } from "@/models/GroupChat";
import { IUser } from "@/models/User";
import { IClientGroupChat } from "@/types/user";
import { getUserProfile } from "./auth";

export function sterilizeClientGroupChat(
  serverGroupChat: Pick<
    Omit<IGroupChat, "members"> & { members: IUser[] },
    "imageUrl" | "members" | "id" | "unreadCounts" | "latestMessageAt"
  >,
  userId: string
): IClientGroupChat {
  return {
    imageUrl: serverGroupChat.imageUrl,
    members: serverGroupChat.members
      .map((member) => getUserProfile(member))
      .filter((profile) => profile.id !== userId),
    chatId: serverGroupChat.id,
    unreadMessages: serverGroupChat.unreadCounts.get(userId) ?? 0,
    lastMessageAt: serverGroupChat.latestMessageAt
  };
}
