import { createSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { SESSION_EXPIRY_SECONDS } from "@/models/Session";
import SignupSession, {
  ISignupSession,
  SESSION_EXPIRY_SECONDS as SIGNUP_SESSION_EXPIRY_SECONDS
} from "@/models/SignupSession";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

interface IGoogleUser {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

export async function GET(req: NextRequest) {
  let logsList = [];
  try {
    await dbConnect();
    logsList.push("1");
    await Message.create({
      content: "this is coming from the callback",
      sender: "6572618ca7f7e2ff875afc9b",
      chatRef: "DirectMessage",
      chat: "657e46bc1bc6db8efca604b7"
    });
    logsList.push("2");

    const code = "askdjlaklsjd";
    logsList.push("3");

    // const code = req.nextUrl.searchParams.get("code");
    if (code.length > 4) {
      console.log(code);
    }
    logsList.push("4");

    if (!code) {
      return NextResponse.json({ message: "response 1" }, { status: 400 });
      redirect("/login");
    }
    logsList.push("5");

    const { id_token } = await getTokens(code);
    logsList.push("6");

    const googleUser = jwt.decode(id_token) as IGoogleUser;
    logsList.push("7");

    const googleId = googleUser.sub;
    logsList.push("8");

    const existingUser = await User.findOne({ googleId });
    logsList.push("9");

    if (existingUser) {
      const session = await createSession(existingUser);
      logsList.push("a10");

      const res = NextResponse.redirect(new URL("/", process.env.BASE_URL));
      logsList.push("a11");

      res.cookies.set({
        name: "session",
        value: "1" + session.id, // Prefix verified user session with "1"
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * SESSION_EXPIRY_SECONDS),
        sameSite: "lax"
      });
      logsList.push("a12");

      return NextResponse.json({ message: "response 2" }, { status: 400 });
      return res;
    } else {
      logsList.push("b10");

      const session = await SignupSession.create<ISignupSession>({
        email: googleUser.email,
        googleId
      });
      logsList.push("b11");

      const res = NextResponse.redirect(
        new URL("/signup", process.env.BASE_URL)
      );
      logsList.push("b12");

      res.cookies.set({
        name: "session",
        value: "0" + session.id, // Prefix signup session with "0"
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * SIGNUP_SESSION_EXPIRY_SECONDS),
        sameSite: "lax"
      });
      logsList.push("b13");

      return NextResponse.json({ message: "response 3" }, { status: 400 });
      return res;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: JSON.stringify(logsList) },
      { status: 400 }
    );
    redirect("/login");
  }
}

interface ITokens {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token: string;
}

async function getTokens(code: string): Promise<ITokens> {
  const url = "https://oauth2.googleapis.com/token";

  const body = {
    code,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL as string,
    grant_type: "authorization_code"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    });

    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
