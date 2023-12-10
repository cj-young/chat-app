import { IDirectMessage } from "@/models/DirectMessage";
import { IUser } from "@/models/User";
import { IClientDm } from "@/types/user";
import { getUserProfile } from "./auth";

import "server-only";

export function sterilizeClientDm(
  serverDm: Omit<IDirectMessage, "user1" | "user2"> & {
    user1: IUser;
    user2: IUser;
  },
  clientId: string
): IClientDm {
  const clientIsUser1 = clientId === serverDm.user1.id;

  return {
    user: clientIsUser1
      ? getUserProfile(serverDm.user2)
      : getUserProfile(serverDm.user1),
    unreadMessages: clientIsUser1 ? serverDm.user1Unread : serverDm.user2Unread,
    chatId: serverDm.id
  };
}
