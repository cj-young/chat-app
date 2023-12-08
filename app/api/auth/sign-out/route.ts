import dbConnect from "@/lib/dbConnect";
import Session from "@/models/Session";
import SignupSession from "@/models/SignupSession";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ message: "Already signed out" });
    }

    const sessionTag = sessionId[0];

    await dbConnect();

    if (sessionTag === "0") {
      await SignupSession.findByIdAndDelete(sessionId.slice(1));
    } else {
      await Session.findByIdAndDelete(sessionId.slice(1));
    }

    const res = NextResponse.redirect(
      new URL("/login", process.env.BASE_URL as string)
    );
    res.cookies.delete("session");

    return res;
  } catch (error) {
    console.error(error);
    const res = NextResponse.redirect("/login");
    res.cookies.delete("session");
    return res;
  }
}
