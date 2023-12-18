import { IGroupChat } from "@/models/GroupChat";
import { IUser } from "@/models/User";
import { IClientGroupChat } from "@/types/user";
import { getUserProfile } from "./auth";

export function sterilizeClientGroupChat(
  serverGroupChat: Pick<
    Omit<IGroupChat, "members"> & {
      members: { user: IUser; unreadMessages: number }[];
    },
    "imageUrl" | "members" | "id" | "latestMessageAt"
  >,
  userId: string
): IClientGroupChat {
  return {
    imageUrl: serverGroupChat.imageUrl,
    members: serverGroupChat.members
      .map((member) => getUserProfile(member.user))
      .filter((profile) => profile.id !== userId),
    chatId: serverGroupChat.id,
    unreadMessages:
      serverGroupChat.members.filter((member) => member.user.id === userId)[0]
        ?.unreadMessages ?? 0,
    lastMessageAt: serverGroupChat.latestMessageAt
  };
}
