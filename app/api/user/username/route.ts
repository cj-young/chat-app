import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import { usernameSchema } from "@/lib/schema";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { newUsername } = (await req.json()) as { newUsername: string };

    const parsedData = usernameSchema.safeParse({
      username: newUsername
    });
    if (!parsedData.success) {
      return NextResponse.json({ message: parsedData.error }, { status: 400 });
    }

    const existingUser = await User.findOne<IUser>({ username: newUsername });
    if (existingUser) {
      if (existingUser.id === user.id) {
        return NextResponse.json({
          message: "Username already in use by requester"
        });
      } else {
        return NextResponse.json(
          { message: "That username is taken" },
          { status: 400 }
        );
      }
    }

    await User.findByIdAndUpdate(user.id, {
      username: newUsername
    });

    return NextResponse.json({ message: "Successfully updated username" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
