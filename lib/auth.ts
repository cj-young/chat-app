import Session from "@/models/Session";
import { IUser } from "@/models/User";
import dbConnect from "./dbConnect";

const EXPIRY_TIME = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function createSession(user: IUser) {
  await dbConnect();

  const expiresAt = new Date(Date.now() + EXPIRY_TIME);

  const session = await Session.create({
    user: user.id,
    expiresAt
  });

  return session;
}
