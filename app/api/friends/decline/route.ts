import { getSession, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();
    const session = await query.populate<IUser>("user");

    if (!session?.user) return invalidSession();
    const { user } = session;

    const { receiverId } = (await req.json()) as { receiverId: string };

    const sender = await User.findByIdAndUpdate<IUser>(user.id, {
      $pull: { friendRequests: receiverId }
    });

    return NextResponse.json({
      message: "Successfully declined friend request"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
