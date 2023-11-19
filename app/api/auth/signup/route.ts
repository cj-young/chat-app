import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import SignupSession, {
  ISignupSession,
  SESSION_EXPIRY_SECONDS
} from "@/models/SignupSession";

export async function POST(req: NextRequest) {
  try {
    const { password, confirmPassword, email } =
      (await req.json()) as SignUpCredentials;

    if (!password || !confirmPassword || !email) {
      return NextResponse.json(
        { message: "All fields must be filled" },
        { status: 401 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 401 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 401 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const session = (await SignupSession.findOneAndUpdate(
      { email },
      {
        email,
        password: hashedPassword
      },
      { upsert: true, new: true }
    )) as ISignupSession;

    const res = NextResponse.json({ message: "Successfully signed up" });

    res.cookies.set({
      name: "session",
      value: "0" + session.id, // Prefix signup session with "0"
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * SESSION_EXPIRY_SECONDS),
      sameSite: "lax"
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred, please try again" },
      { status: 500 }
    );
  }
}
