import Session from "@/models/Session";
import { IUser } from "@/models/User";
import dbConnect from "./dbConnect";

export async function createSession(user: IUser) {
  await dbConnect();

  const session = await Session.create({
    user: user.id
  });

  return session;
}
