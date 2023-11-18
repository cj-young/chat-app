import Session from "@/models/Session";
import { IUser } from "@/models/User";
import dbConnect from "./dbConnect";
import { IUnverifiedUser } from "@/models/UnverifiedUser";
import SignupSession from "@/models/SignupSession";

const SIGNUP_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour

export async function createSession(user: IUser) {
  await dbConnect();

  const session = await Session.create({
    user: user.id
  });

  return session;
}

export async function createSignupSession(user: IUnverifiedUser) {
  await dbConnect();

  const expiresAt = new Date(Date.now() + SIGNUP_EXPIRY_TIME);

  const session = await SignupSession.create({
    user: user.id,
    expiresAt
  });

  return session;
}
