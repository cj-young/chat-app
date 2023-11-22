import Session from "@/models/Session";
import SignupSession from "@/models/SignupSession";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Already signed out" });
    }

    const sessionTag = sessionId[0];

    if (sessionTag === "0") {
      await SignupSession.findByIdAndDelete(sessionId.slice(1));
    } else {
      await Session.findByIdAndDelete(sessionId.slice(1));
    }

    const res = NextResponse.json({ message: "Successfully signed out" });
    res.cookies.delete("session");
    return res;
  } catch (error) {
    console.error(error);
    const res = NextResponse.json({
      message: "An error occurred while signing out"
    });
    res.cookies.delete("session");
  }
}
