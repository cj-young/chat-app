import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import { uploadProfilePicture } from "@/lib/firebase";
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

    const formData = await req.formData();
    const newProfilePicture: File | undefined = formData.get(
      "newProfilePicture"
    ) as unknown as File;
    if (!newProfilePicture) {
      return NextResponse.json(
        { message: "No new profile picture provided" },
        { status: 400 }
      );
    }

    const imageUrl = await uploadProfilePicture(newProfilePicture);

    await User.findByIdAndUpdate(user.id, {
      imageUrl
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
