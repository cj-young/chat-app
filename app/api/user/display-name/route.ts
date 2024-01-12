import { getSession, invalidSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { displayNameSchema } from "@/lib/schema";
import User, { IUser } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { query, userType } = getSession(sessionId);
    if (userType !== "verified") return invalidSession();

    const session = await query.populate<{ user: IUser }>("user");
    if (!session?.user) return invalidSession();
    const { user } = session;

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
