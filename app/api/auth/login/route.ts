import { createSession, createSignupSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { ISession, SESSION_EXPIRY_SECONDS } from "@/models/Session";
import { ISignupSession } from "@/models/SignupSession";
import UnverifiedUser from "@/models/UnverifiedUser";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const res = NextResponse.json({ message: "Successfully logged in" });

    const { identifier, password } = (await req.json()) as LoginCredentials;

    const user = (await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    })) as IUser;

    if (!user) {
      const unverifiedUser = await UnverifiedUser.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      });
      if (!unverifiedUser) {
        return authFailed();
      }
      const session = (await createSignupSession(
        unverifiedUser
      )) as ISignupSession;

      res.cookies.set({
        name: "session",
        value: "0" + session.id, // Prefix unverified user session with "0"
        httpOnly: true,
        expires: session.createdAt.getTime() + SESSION_EXPIRY_SECONDS * 1000
      });

      return res;
    } else {
      const passwordsMatch = await user.checkPassword(password);
      if (!passwordsMatch) {
        return authFailed();
      }
      const session = (await createSession(user)) as ISession;

      res.cookies.set({
        name: "session",
        value: "1" + session.id, // Prefix verified user session with "1"
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60)
      });

      return res;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred, please try again" },
      { status: 500 }
    );
  }
}

function authFailed() {
  return NextResponse.json(
    { message: "Invalid username or password" },
    { status: 401 }
  );
}
