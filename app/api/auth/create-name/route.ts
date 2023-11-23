import { createSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { SESSION_EXPIRY_SECONDS } from "@/models/Session";
import SignupSession, { ISignupSession } from "@/models/SignupSession";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, displayName } = (await req.json()) as {
      username: string;
      displayName: string;
    };

    const sessionId = req.cookies.get("session")?.value;

    if (!sessionId || sessionId[0] !== "0") {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    await dbConnect();

    const session = await SignupSession.findById<ISignupSession>(
      sessionId.slice(1)
    );

    if (!session || session.isExpired()) {
      return NextResponse.json(
        { message: "Session has expired" },
        { status: 401 }
      );
    }

    const existingUser = await User.findOne<IUser>({ username });

    if (existingUser) {
      return NextResponse.json(
        { message: "That username is taken" },
        { status: 409 }
      );
    }

    const user = await User.create({
      username,
      displayName,
      password: session.password,
      email: session.email,
      googleId: session.googleId
    });

    const newSession = await createSession(user);

    const res = NextResponse.json({ message: "Successfully signed up" });

    res.cookies.set({
      name: "session",
      value: "1" + newSession.id, // Prefix verified user session with "1"
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * SESSION_EXPIRY_SECONDS),
      sameSite: "lax"
    });

    SignupSession.findByIdAndDelete(sessionId.slice(1));
    // No need to await deletion, the document will expire anyway if it fails

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred while processing the request" },
      { status: 500 }
    );
  }
}
