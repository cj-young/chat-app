import Session, { ISession } from "@/models/Session";
import SignupSession, { ISignupSession } from "@/models/SignupSession";
import { IUser } from "@/models/User";
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
    user: IUser;
  }>("user");

  return !session || session.isExpired() ? null : session.user;
}

export async function getSignupSession(sessionId: string) {
  await dbConnect();
  const session = await SignupSession.findById<ISignupSession>(sessionId);
  return !session || session.isExpired() ? null : session;
}
