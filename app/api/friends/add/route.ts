import { getSession, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { receiverUsername } = await req.json();

    if (!receiverUsername) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query;
    if (!session?.user) return invalidSession();

    const receiver = await User.findOneAndUpdate<IUser>(
      { username: receiverUsername },
      {
        $addToSet: {
          friendRequests: session.user
        }
      },
      { new: true }
    );

    if (!receiver) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Friend request sent to ${receiverUsername}`
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
