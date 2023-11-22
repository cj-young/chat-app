import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Session, { ISession } from "@/models/Session";
import SignupSession, { ISignupSession } from "@/models/SignupSession";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sessionParam = req.url.slice(req.url.lastIndexOf("/") + 1);

    const sessionId = sessionParam.slice(1);
    const sessionTag = sessionParam[0];

    if (sessionTag === "1") {
      const session = (await Session.findById(sessionId)) as ISession;
      if (session && !session.isExpired()) {
        return NextResponse.json({ authStatus: "authenticated" });
      }
    } else if (sessionTag === "0") {
      const session = (await SignupSession.findById(
        sessionId
      )) as ISignupSession;
      if (session && !session.isExpired()) {
        return NextResponse.json({ authStatus: "signingUp" });
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ authStatus: "unauthenticated" });
}
