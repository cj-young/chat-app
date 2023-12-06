import Session, { ISession } from "@/models/Session";
import SignupSession, { ISignupSession } from "@/models/SignupSession";
import User, { IUser } from "@/models/User";
import dbConnect from "./dbConnect";

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
    user: Omit<IUser, "friends" | "friendRequests"> & {
      friends: IUser[];
      friendRequests: IUser[];
    };
  }>({
    path: "user",
    model: User,
    populate: ["friends", "friendRequests"]
  });

  return !session || session.isExpired() ? null : session.user;
}

export async function getSignupSession(sessionId: string) {
  await dbConnect();
  const session = await SignupSession.findById<ISignupSession>(sessionId);
  return !session || session.isExpired() ? null : session;
}

export function getUserProfile(
  user: Pick<IUser, "email" | "username" | "displayName" | "imageUrl">
) {
  return {
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    imageUrl: user.imageUrl
  };
}
