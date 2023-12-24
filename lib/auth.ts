import DirectMessage, { IDirectMessage } from "@/models/DirectMessage";
import Session, { ISession } from "@/models/Session";
import SignupSession, { ISignupSession } from "@/models/SignupSession";
import User, { IUser } from "@/models/User";
import { IProfile } from "@/types/user";
import { NextResponse } from "next/server";
import dbConnect from "./db";

import GroupChat, { IGroupChat } from "@/models/GroupChat";
import { IServer } from "@/models/server/Server";
import "server-only";

export async function createSession(user: IUser): Promise<ISession> {
  await dbConnect();

  const session = await Session.create({
    user: user.id
  });

  return session;
}

export async function getSessionUser(sessionId: string) {
  await dbConnect();

  const session = await Session.findById<ISession>(sessionId).populate<{
    user: Omit<
      IUser,
      "friends" | "friendRequests" | "directMessages" | "groupChats" | "servers"
    > & {
      friends: IUser[];
      friendRequests: IUser[];
      directMessages: (Omit<IDirectMessage, "user1" | "user2"> & {
        user1: IUser;
        user2: IUser;
      })[];
      groupChats: (Omit<IGroupChat, "members"> & {
        members: { user: IUser; unreadMessages: number }[];
      })[];
      servers: { server: IServer; uiOrder: number }[];
    };
  }>({
    path: "user",
    model: User,
    populate: [
      "friends",
      "friendRequests",
      "servers.server",
      {
        path: "directMessages",
        model: DirectMessage,
        populate: ["user1", "user2"]
      },
      {
        path: "groupChats",
        model: GroupChat,
        populate: ["members.user"]
      }
    ]
  });

  return !session || session.isExpired() ? null : session.user;
}

export async function getSignupSession(sessionId: string) {
  await dbConnect();
  const session = await SignupSession.findById<ISignupSession>(sessionId);

  return !session || session.isExpired() ? null : session;
}

export function getUserProfile(
  user: Pick<
    IUser,
    | "email"
    | "username"
    | "displayName"
    | "imageUrl"
    | "id"
    | "preferredOnlineStatus"
    | "isOnline"
  >
): IProfile {
  const onlineStatus =
    user.isOnline && user.preferredOnlineStatus !== "invisible"
      ? user.preferredOnlineStatus
      : "offline";
  return {
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    imageUrl: user.imageUrl,
    id: user.id,
    onlineStatus
  };
}

export function getSession(sessionId: string) {
  if (sessionId[0] === "0") {
    return {
      query: SignupSession.findById<ISignupSession>(sessionId.slice(1)),
      userType: "signingUp"
    };
  } else if (sessionId[0] === "1") {
    return {
      query: Session.findById<ISession>(sessionId.slice(1)),
      userType: "verified"
    };
  } else {
    throw new Error("Invalid session ID: prefix of '1' or '0' not provided");
  }
}

export function invalidSession() {
  return NextResponse.json({ message: "Invalid session" }, { status: 401 });
}
