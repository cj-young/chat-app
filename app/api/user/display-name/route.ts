import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import { displayNameSchema } from "@/lib/schema";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { newDisplayName } = (await req.json()) as { newDisplayName: string };

    const parsedData = displayNameSchema.safeParse({
      displayName: newDisplayName
    });
    if (!parsedData.success) {
      return NextResponse.json({ message: parsedData.error }, { status: 400 });
    }

    await User.findByIdAndUpdate(user.id, {
      displayName: newDisplayName
    });

    return NextResponse.json({ message: "Successfully updated display name" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
