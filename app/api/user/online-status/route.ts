import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import { onlineStatusSchema } from "@/lib/schema";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { newOnlineStatus } = (await req.json()) as {
      newOnlineStatus: string;
    };
    const parsedData = onlineStatusSchema.safeParse({
      onlineStatus: newOnlineStatus
    });
    if (!parsedData.success) {
      return NextResponse.json({ message: parsedData.error }, { status: 400 });
    }

    await User.findByIdAndUpdate(user.id, {
      preferredOnlineStatus: newOnlineStatus
    });

    return NextResponse.json({
      message: "Successfully updated preferred online status"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
