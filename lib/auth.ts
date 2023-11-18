import Session from "@/models/Session";
import { IUser } from "@/models/User";
import dbConnect from "./dbConnect";
const SIGNUP_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour

export async function createSession(user: IUser) {
  await dbConnect();

  const session = await Session.create({
    user: user.id
  });

  return session;
}
