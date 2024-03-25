import { createSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
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
  try {
    const code = "askdjlaklsjd";
    // const code = req.nextUrl.searchParams.get("code");
    if (code.length > 4) {
      throw new Error("thi si an error");
    }
    if (!code) {
      redirect("/login");
    }

    await dbConnect();

    const { id_token } = await getTokens(code);

    const googleUser = jwt.decode(id_token) as IGoogleUser;
    const googleId = googleUser.sub;
    const existingUser = await User.findOne({ googleId });

    if (existingUser) {
      const session = await createSession(existingUser);
      const res = NextResponse.redirect(new URL("/", process.env.BASE_URL));

      res.cookies.set({
        name: "session",
        value: "1" + session.id, // Prefix verified user session with "1"
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * SESSION_EXPIRY_SECONDS),
        sameSite: "lax"
      });

      return res;
    } else {
      const session = await SignupSession.create<ISignupSession>({
        email: googleUser.email,
        googleId
      });
      const res = NextResponse.redirect(
        new URL("/signup", process.env.BASE_URL)
      );

      res.cookies.set({
        name: "session",
        value: "0" + session.id, // Prefix signup session with "0"
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * SIGNUP_SESSION_EXPIRY_SECONDS),
        sameSite: "lax"
      });

      return res;
    }
  } catch (error) {
    console.error(error);
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
